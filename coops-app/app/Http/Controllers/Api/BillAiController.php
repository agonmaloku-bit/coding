<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ResponseResource;
use App\Models\Bill;
use App\Models\BillAiCheck;
use App\Services\AI\BillExtractor;
use App\Services\AI\BillVerifier;
use Illuminate\Http\Request;

class BillAiController extends Controller
{
    /**
     * 403 if the current user lacks the "Bill Verify AI" permission.
     */
    protected function authorizeAiVerify(Request $request): void
    {
        $user = $request->user();
        if (!$user || !$user->can('Bill Verify AI')) {
            abort(403, 'You do not have permission to use AI verification.');
        }
    }

    /**
     * Extract structured fields from an uploaded invoice file. Used by the
     * "Add bill" modal to pre-fill the form.
     * POST /admin/ai/extract-bill   (multipart, field "file")
     */
    public function extractFromUpload(Request $request)
    {
        $this->authorizeAiVerify($request);
        $request->validate([
            'file' => 'required|file|max:8192', // 8 MB
        ]);

        $result = BillExtractor::extract($request->file('file'));
        return ResponseResource::make(['data' => $result]);
    }

    /**
     * Verify a bill against its attached invoice using AI.
     * POST /admin/bills/{id}/verify-ai
     */
    public function verify(Request $request, $id)
    {
        $this->authorizeAiVerify($request);
        $bill = Bill::with('files')->findOrFail($id);
        $userId = optional($request->user())->id;

        $result = BillVerifier::verify($bill, $userId);
        return ResponseResource::make(['data' => $result]);
    }

    /**
     * Return the most recent AI check for a bill (so the panel survives reloads).
     * GET /admin/bills/{id}/ai-checks/latest
     */
    public function latest($id)
    {
        $row = BillAiCheck::where('bill_id', $id)->orderByDesc('id')->first();
        if (!$row) return ResponseResource::make(['data' => null]);

        $payload = $row->findings ?? [];
        return ResponseResource::make(['data' => [
            'ok'         => true,
            'severity'   => $row->severity,
            'message'    => null,
            'findings'   => $payload['issues']    ?? [],
            'extracted'  => $payload['extracted'] ?? null,
            'expected'   => $payload['expected']  ?? null,
            'check_id'   => $row->id,
            'created_at' => optional($row->created_at)->toIso8601String(),
            'model'      => $row->model,
        ]]);
    }
}
