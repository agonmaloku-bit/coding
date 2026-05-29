<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\BillReport;
use App\Enums\Permissions;
use App\Enums\Roles;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BillReportController extends Controller
{
    /**
     * Generate a Procesverbal PDF for a set of selected bills.
     * Eligible bills: status 2 (Pending) or status 3 (Approved from CEO).
     * After generation, all included bills are marked as Printed & Closed (status=6).
     *
     * POST /admin/bills/report
     * Body: { "bill_ids": [1, 2, 3] }
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // Generating a new report (procesverbal) requires the Reports Add permission.
        if (!$user->can(Permissions::REPORTS_ADD)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'bill_ids'   => 'required|array|min:1',
            'bill_ids.*' => 'integer|exists:bills,id',
        ]);

        // Load bills — eligible statuses: Pending (2), Approved CEO (3), Approved Admin (5), Printed & Closed (6)
        $bills = Bill::with(['supplierName', 'departmentName.company', 'createdBy'])
            ->whereIn('id', $request->bill_ids)
            ->whereIn('status', [2, 3, 5, 6])
            ->whereNull('deleted_at')
            ->get();

        if ($bills->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No eligible bills found. Bills must be Pending, Approved, or Printed & Closed status.',
            ], 422);
        }

        $year = (int) Carbon::now()->year;
        $serial = BillReport::nextSerial($year);
        $generatedAt = Carbon::now()->format('d.m.Y');
        $locale = $request->input('locale', 'sq');

        $labels = $this->buildLabels($locale);

        // Resolve company logo file path for DomPDF (needs absolute disk path, not URL)
        $logoPath = null;
        foreach ($bills as $bill) {
            $company = optional(optional($bill->departmentName)->company);
            if ($company && $company->logo) {
                $candidate = storage_path('app/public/' . $company->logo);
                if (file_exists($candidate)) {
                    $logoPath = $candidate;
                    break;
                }
            }
        }

        // Generate PDF
        $pdf = Pdf::loadView('reports.procesverbal', [
            'bills'        => $bills,
            'serialNumber' => $serial['serial_number'],
            'generatedAt'  => $generatedAt,
            'locale'       => $locale,
            'labels'       => $labels,
            'logoPath'     => $logoPath,
        ])->setPaper('a4', 'landscape');

        // Save to storage
        $filename = 'procesverbal_' . str_replace('/', '-', $serial['serial_number']) . '_' . Carbon::now()->format('YmdHis') . '.pdf';
        $storagePath = 'reports/' . $filename;
        Storage::disk('local')->put($storagePath, $pdf->output());

        // Create the report record
        $report = BillReport::create([
            'serial_number' => $serial['serial_number'],
            'year'          => $year,
            'sequence'      => $serial['sequence'],
            'generated_by'  => $user->id,
            'file_path'     => $storagePath,
            'bill_ids'      => $bills->pluck('id')->toArray(),
        ]);

        // Promote all selected bills to Delivered to Finances (status=7)
        // Bills already at 7 are left unchanged
        Bill::whereIn('id', $bills->pluck('id'))
            ->whereIn('status', [2, 3, 5, 6])
            ->update([
                'status'     => 7,
                'updated_by' => $user->id,
            ]);

        // Return PDF inline for direct printing
        return response($pdf->output(), 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $filename . '"',
            'X-Report-Id'         => $report->id,
            'X-Serial-Number'     => $report->serial_number,
        ]);
    }

    /**
     * List all generated reports.
     * GET /admin/bills/report
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Listing reports requires the Reports Show All permission.
        if (!$user->can(Permissions::REPORTS_SHOW_ALL)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $reports = BillReport::with('generatedBy')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json([
            'data' => $reports->map(fn($r) => [
                'id'            => $r->id,
                'serial_number' => $r->serial_number,
                'generated_at'  => $r->created_at->format('d.m.Y H:i'),
                'generated_by'  => $r->generatedBy
                    ? $r->generatedBy->first_name . ' ' . $r->generatedBy->last_name
                    : '-',
                'bill_count'    => count($r->bill_ids),
            ]),
            'total' => $reports->total(),
        ]);
    }

    /**
     * Build locale-aware label array for the PDF blade.
     */
    private function buildLabels(string $locale): array
    {
        $sq = $locale === 'sq';
        return [
            'title_sub'          => $sq ? 'I DORËZIMIT TË FATURAVE NGA PROKURIMI TEK FINANCAT' : 'INVOICE DELIVERY FROM PROCUREMENT TO FINANCE',
            'page_header'        => $sq ? 'PROCESVERBAL I PRANIMIT TË FATURAVE' : 'INVOICE RECEIPT PROCESVERBAL',
            'date_label'         => $sq ? 'Data' : 'Date',
            'serial_label'       => $sq ? 'Numri I Procesverba:' : 'Report No:',
            'col_nr'             => 'Nr',
            'col_type'           => $sq ? 'Lloji' : 'Type',
            'col_value'          => $sq ? 'Vlera' : 'Value',
            'col_bill_no'        => $sq ? 'Nr i faturës' : 'Invoice No',
            'col_department'     => $sq ? 'Departamenti' : 'Department',
            'col_supplier'       => $sq ? 'Furnitori' : 'Supplier',
            'col_created_by'     => $sq ? 'Krijuar nga' : 'Created By',
            'col_date'           => $sq ? 'Data' : 'Date',
            'col_step'           => 'Step',
            'col_status'         => 'Status',
            'col_approved'       => $sq ? 'Aprovuar' : 'Approved',
            'col_notes'          => $sq ? 'Tjera' : 'Notes',
            'status_requested'   => $sq ? 'Kërkuar' : 'Requested',
            'status_pending'     => $sq ? 'Në pritje' : 'Pending',
            'status_approved_ceo'=> $sq ? 'Aprovuar (CEO)' : 'Approved (CEO)',
            'status_canceled'    => $sq ? 'Anuluar' : 'Canceled',
            'status_approved'    => $sq ? 'Aprovuar' : 'Approved',
            'status_printed'     => $sq ? 'Printuar' : 'Printed',
            'status_delivered'   => $sq ? 'Dorëzuar tek Financat' : 'Delivered to Finance',
            'rep_finance'        => $sq ? 'Përfaqësuesi i Financave:' : 'Finance Representative:',
            'rep_procurement'    => $sq ? 'Përfaqësuesi i Prokurimit:' : 'Procurement Representative:',
            'signature'          => $sq ? 'Nënshkrimi:' : 'Signature:',
            'received_date'      => $sq ? 'Data e Pranimit:' : 'Date Received:',
        ];
    }

    /**
     * Download / re-print a previously generated report.
     * GET /admin/bills/report/{id}/download
     */
    public function download(int $id)
    {
        $user = request()->user();

        // Downloading / re-printing a report requires the Reports Show permission.
        if (!$user->can(Permissions::REPORTS_SHOW)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $report = BillReport::findOrFail($id);

        if (!$report->file_path || !Storage::disk('local')->exists($report->file_path)) {
            return response()->json(['success' => false, 'message' => 'File not found'], 404);
        }

        $filename = basename($report->file_path);

        return response(Storage::disk('local')->get($report->file_path), 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $filename . '"',
        ]);
    }
}
