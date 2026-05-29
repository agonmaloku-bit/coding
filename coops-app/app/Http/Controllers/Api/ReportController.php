<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Enums\Permissions;
use App\Models\Bill;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Aggregated reports for departments, suppliers and users.
 *
 * Each endpoint accepts the optional query params:
 *   - preset: today | yesterday | this_week | last_week | this_month | last_month | custom
 *   - from:   YYYY-MM-DD (required when preset=custom)
 *   - to:     YYYY-MM-DD (required when preset=custom)
 *
 * Bills are filtered by created_at within the resolved range and only
 * "approved" statuses are counted (3=Approved CEO, 5=Approved Admin,
 * 6=Printed & Closed, 7=Delivered to Finances).
 */
class ReportController extends Controller
{
    /** Statuses considered as "approved through department / CEO" onwards. */
    private const APPROVED_STATUSES = [3, 5, 6, 7];

    public function departments(Request $request)
    {
        $this->authorizeReports($request);
        [$from, $to] = $this->resolveRange($request);

        $rows = DB::table('bills')
            ->leftJoin('departments', 'departments.id', '=', 'bills.assigned_dep_id')
            ->whereNull('bills.deleted_at')
            ->whereIn('bills.status', self::APPROVED_STATUSES)
            ->whereBetween('bills.created_at', [$from, $to])
            ->select(
                'bills.assigned_dep_id as id',
                DB::raw("COALESCE(departments.name, '—') as name"),
                DB::raw('COUNT(bills.id) as bill_count'),
                DB::raw('COALESCE(SUM(bills.value), 0) as total_value')
            )
            ->groupBy('bills.assigned_dep_id', 'departments.name')
            ->orderByDesc('bill_count')
            ->get();

        return $this->respond($rows, $from, $to);
    }

    public function suppliers(Request $request)
    {
        $this->authorizeReports($request);
        [$from, $to] = $this->resolveRange($request);

        $rows = DB::table('bills')
            ->leftJoin('suppliers', 'suppliers.id', '=', 'bills.supplier')
            ->whereNull('bills.deleted_at')
            ->whereIn('bills.status', self::APPROVED_STATUSES)
            ->whereBetween('bills.created_at', [$from, $to])
            ->select(
                'bills.supplier as id',
                DB::raw("COALESCE(suppliers.name, '—') as name"),
                DB::raw('COUNT(bills.id) as bill_count'),
                DB::raw('COALESCE(SUM(bills.value), 0) as total_value')
            )
            ->groupBy('bills.supplier', 'suppliers.name')
            ->orderByDesc('bill_count')
            ->get();

        return $this->respond($rows, $from, $to);
    }

    public function users(Request $request)
    {
        $this->authorizeReports($request);
        [$from, $to] = $this->resolveRange($request);

        // Group bills by the user who performed the FIRST approval step
        // (bill_comments.steps = 1, not canceled). The bill must also be in
        // an approved-onwards status and created within the selected range.
        // We pick one row per bill (the earliest first-step approval) so a
        // bill is counted under exactly one user.
        $firstApproverSub = DB::table('bill_comments as bc1')
            ->select('bc1.bill_id', 'bc1.user_id')
            ->where('bc1.steps', 1)
            ->where(function ($q) {
                $q->whereNull('bc1.canceled')->orWhere('bc1.canceled', 0);
            })
            ->whereNull('bc1.deleted_at')
            ->whereRaw('bc1.id = (
                SELECT MIN(bc2.id) FROM bill_comments bc2
                WHERE bc2.bill_id = bc1.bill_id
                  AND bc2.steps = 1
                  AND (bc2.canceled IS NULL OR bc2.canceled = 0)
                  AND bc2.deleted_at IS NULL
            )');

        $rows = DB::table('bills')
            ->joinSub($firstApproverSub, 'fa', function ($join) {
                $join->on('fa.bill_id', '=', 'bills.id');
            })
            ->leftJoin('users', 'users.id', '=', 'fa.user_id')
            ->whereNull('bills.deleted_at')
            ->whereIn('bills.status', self::APPROVED_STATUSES)
            ->whereBetween('bills.created_at', [$from, $to])
            ->select(
                'fa.user_id as id',
                DB::raw("COALESCE(CONCAT(users.first_name, ' ', users.last_name), '—') as name"),
                DB::raw('COUNT(bills.id) as bill_count'),
                DB::raw('COALESCE(SUM(bills.value), 0) as total_value')
            )
            ->groupBy('fa.user_id', 'users.first_name', 'users.last_name')
            ->orderByDesc('bill_count')
            ->get();

        return $this->respond($rows, $from, $to);
    }

    private function authorizeReports(Request $request): void
    {
        $user = $request->user();
        if (!$user || !$user->can(Permissions::REPORTS_SHOW_ALL)) {
            abort(response()->json(['success' => false, 'message' => 'Unauthorized'], 403));
        }
    }

    /**
     * @return array{0: Carbon, 1: Carbon}
     */
    private function resolveRange(Request $request): array
    {
        $preset = $request->query('preset', 'this_month');
        $now    = Carbon::now();

        switch ($preset) {
            case 'today':
                return [$now->copy()->startOfDay(), $now->copy()->endOfDay()];
            case 'yesterday':
                $y = $now->copy()->subDay();
                return [$y->copy()->startOfDay(), $y->copy()->endOfDay()];
            case 'this_week':
                return [$now->copy()->startOfWeek(), $now->copy()->endOfWeek()];
            case 'last_week':
                $w = $now->copy()->subWeek();
                return [$w->copy()->startOfWeek(), $w->copy()->endOfWeek()];
            case 'this_month':
                return [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()];
            case 'last_month':
                $m = $now->copy()->subMonthNoOverflow();
                return [$m->copy()->startOfMonth(), $m->copy()->endOfMonth()];
            case 'custom':
                $from = $request->query('from');
                $to   = $request->query('to');
                if (!$from || !$to) {
                    abort(response()->json(['success' => false, 'message' => 'from and to are required for custom range'], 422));
                }
                return [
                    Carbon::parse($from)->startOfDay(),
                    Carbon::parse($to)->endOfDay(),
                ];
            default:
                return [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()];
        }
    }

    private function respond($rows, Carbon $from, Carbon $to)
    {
        $data = $rows->map(function ($r) {
            return [
                'id'          => $r->id,
                'name'        => $r->name,
                'bill_count'  => (int) $r->bill_count,
                'total_value' => (float) $r->total_value,
            ];
        });

        return response()->json([
            'success' => true,
            'range'   => [
                'from' => $from->toDateString(),
                'to'   => $to->toDateString(),
            ],
            'totals'  => [
                'bill_count'  => $data->sum('bill_count'),
                'total_value' => $data->sum('total_value'),
            ],
            'data'    => $data->values(),
        ]);
    }
}
