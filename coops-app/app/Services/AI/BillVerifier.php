<?php

namespace App\Services\AI;

use App\Models\Bill;
use App\Models\BillAiCheck;
use App\Models\BillFiles;
use App\Models\Supplier;
use Carbon\Carbon;

/**
 * Verifies bills (invoices) using OpenAI vision models.
 *
 * Flow:
 *   1. Build a structured "expected" snapshot from the form/DB row
 *      (supplier, bill_no, value, date).
 *   2. Encode the latest invoice attachment (image or PDF) as base64
 *      and send it to the model alongside the expected snapshot.
 *   3. Ask the model to return strict JSON: extracted fields + findings.
 *   4. Compare extracted vs expected, augment findings with our own
 *      deterministic checks (duplicate invoice no, math, date sanity).
 *   5. Persist a BillAiCheck row.
 */
class BillVerifier
{
    public const MAX_IMAGE_BYTES = 8 * 1024 * 1024;   // 8 MB hard cap

    /** Extensions we can send to the vision model directly. */
    public const VISION_EXTS = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'pdf'];

    public static function verify(Bill $bill, ?int $userId = null): array
    {
        if (!OpenAiClient::isConfigured()) {
            return [
                'ok'        => false,
                'severity'  => 'error',
                'message'   => 'AI is not configured. Ask a Super Admin to set the OpenAI API key under Management → AI Settings.',
                'findings'  => [],
                'extracted' => null,
            ];
        }

        $bill->loadMissing(['files']);

        // Resolve supplier display name (column stores the supplier id but the
        // resource sometimes returns the name; cover both).
        $expectedSupplierName = self::resolveSupplierName($bill);

        $expected = [
            'supplier'     => $expectedSupplierName,
            'bill_no'      => $bill->bill_no,
            'value'        => $bill->value,
            'description'  => $bill->description,
            'created_at'   => optional($bill->created_at)->toDateString(),
        ];

        // Pick the most recent attachment we can send to the vision model.
        $file = self::pickBestFile($bill->files ?? collect());
        if (!$file) {
            return [
                'ok'        => true,
                'severity'  => 'warn',
                'message'   => 'No invoice attachment was found on this bill — only field-level checks were run.',
                'findings'  => self::deterministicChecks($bill, null),
                'extracted' => null,
            ];
        }

        $absPath = storage_path('app/' . $file->file_path . '/' . $file->file_id . '.' . $file->file_extension);
        if (!is_file($absPath)) {
            return [
                'ok'        => false,
                'severity'  => 'error',
                'message'   => 'Attachment file not found on disk.',
                'findings'  => [],
                'extracted' => null,
            ];
        }

        $bytes = filesize($absPath);
        if ($bytes > self::MAX_IMAGE_BYTES) {
            return [
                'ok'        => false,
                'severity'  => 'error',
                'message'   => 'Attachment too large for AI verification (>8 MB).',
                'findings'  => [],
                'extracted' => null,
            ];
        }

        $ext = strtolower($file->file_extension);
        $isPdf = $ext === 'pdf';

        // For PDFs we render the first few pages to JPEG via Ghostscript and
        // send them as images so gpt-4o vision can read them. If rendering
        // fails we fall back to a text-only prompt.
        $renderedPages = [];
        if ($isPdf) {
            $renderedPages = PdfRenderer::renderPages($absPath);
        }

        $messages = self::buildMessages($expected, $absPath, $ext, $isPdf, $renderedPages);

        $cfg = OpenAiClient::config();
        $resp = OpenAiClient::chat($messages, [
            'model'           => $cfg['model'],
            'temperature'     => 0,
            'response_format' => ['type' => 'json_object'],
            'max_tokens'      => 1200,
        ]);

        // Cleanup any temp images we rendered for the PDF.
        if (!empty($renderedPages)) {
            PdfRenderer::cleanupFor($renderedPages);
        }

        if (!$resp['ok']) {
            return [
                'ok'        => false,
                'severity'  => 'error',
                'message'   => 'OpenAI request failed: ' . $resp['error'],
                'findings'  => [],
                'extracted' => null,
            ];
        }

        $parsed   = self::safeJsonDecode($resp['content']);
        $extracted = is_array($parsed['extracted'] ?? null) ? $parsed['extracted'] : null;
        $modelFindings = is_array($parsed['findings'] ?? null) ? $parsed['findings'] : [];

        // Combine model findings with deterministic checks.
        $deterministic = self::deterministicChecks($bill, $extracted);
        $allFindings = array_merge($modelFindings, $deterministic);

        $severity = self::overallSeverity($allFindings);

        $check = BillAiCheck::create([
            'bill_id'       => $bill->id,
            'model'         => $cfg['model'],
            'severity'      => $severity,
            'findings'      => [
                'expected'  => $expected,
                'extracted' => $extracted,
                'issues'    => $allFindings,
            ],
            'raw_response'  => is_string($resp['content']) ? mb_substr($resp['content'], 0, 8000) : null,
            'user_id'       => $userId,
            'input_tokens'  => $resp['usage']['prompt_tokens']     ?? null,
            'output_tokens' => $resp['usage']['completion_tokens'] ?? null,
        ]);

        return [
            'ok'        => true,
            'severity'  => $severity,
            'message'   => self::summarizeMessage($severity, count($allFindings)),
            'findings'  => $allFindings,
            'extracted' => $extracted,
            'expected'  => $expected,
            'check_id'  => $check->id,
        ];
    }

    /* ------------------------------------------------------------------ */

    protected static function resolveSupplierName(Bill $bill): ?string
    {
        $sup = $bill->supplier;
        if (is_numeric($sup)) {
            $row = Supplier::find((int) $sup);
            return $row->name ?? null;
        }
        return $sup ? (string) $sup : null;
    }

    protected static function pickBestFile($files)
    {
        return $files
            ->filter(fn($f) => in_array(strtolower($f->file_extension ?? ''), self::VISION_EXTS, true))
            ->sortByDesc(fn($f) => $f->id)
            ->first();
    }

    protected static function buildMessages(array $expected, string $absPath, string $ext, bool $isPdf, array $renderedPages = []): array
    {
        $system = <<<TXT
You are an invoice verification assistant for a corporate operations platform.
You receive an invoice document together with the values that the user typed
into the system. Compare what you can read from the document with the
"expected" values and report any discrepancies.

Respond ONLY with valid JSON, no prose, no markdown. Schema:

{
  "extracted": {
    "supplier": string|null,
    "invoice_number": string|null,
    "invoice_date": string|null,    // ISO YYYY-MM-DD if possible
    "currency": string|null,
    "subtotal": number|null,
    "vat": number|null,
    "total": number|null,
    "iban": string|null,
    "tax_id": string|null,
    "line_items": [{ "description": string, "qty": number|null, "unit_price": number|null, "total": number|null }]
  },
  "findings": [
    {
      "code": string,            // short stable id, e.g. "supplier_mismatch"
      "field": string|null,      // which field on the form/document
      "severity": "ok"|"warn"|"block",
      "message": string,         // human readable, ~1 sentence
      "expected": any|null,
      "actual": any|null
    }
  ]
}

Rules:
- Use "block" only for clear mismatches that should stop approval (e.g. total
  on form is 1240 but invoice clearly shows 1420).
- Use "warn" for fuzzy issues (slight name difference, missing IBAN, illegible
  field, math doesn't add up by a small rounding amount).
- Use "ok" findings sparingly — only to confirm an explicit positive match.
- Numbers must be numeric, not strings. Use `null` if not visible.
- Never invent data. If a field is unreadable, set it to null and add a
  "warn" finding code "unreadable_field".
TXT;

        $userText = "Expected (from the bill form in the system):\n"
            . json_encode($expected, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)
            . "\n\nVerify the attached invoice document against these expected values.";

        $messages = [['role' => 'system', 'content' => $system]];

        if ($isPdf) {
            if (!empty($renderedPages)) {
                // Send the rendered PDF pages as image_url parts.
                $parts = [['type' => 'text', 'text' => $userText
                    . "\n\nThe attached images are pages of the invoice PDF, in order."]];
                foreach ($renderedPages as $imgPath) {
                    if (!is_file($imgPath)) continue;
                    $b64 = base64_encode(file_get_contents($imgPath));
                    $parts[] = ['type' => 'image_url', 'image_url' => [
                        'url'    => 'data:image/jpeg;base64,' . $b64,
                        'detail' => 'high',
                    ]];
                }
                $messages[] = ['role' => 'user', 'content' => $parts];
                return $messages;
            }
            // Fallback: rendering failed, run text-only sanity checks.
            $messages[] = [
                'role' => 'user',
                'content' => $userText
                    . "\n\nNote: the attachment is a PDF and could not be visually decoded. "
                    . "Run only sanity checks on the expected fields and set extracted fields to null.",
            ];
            return $messages;
        }

        $b64 = base64_encode(file_get_contents($absPath));
        $mime = self::mimeFor($ext);
        $messages[] = [
            'role' => 'user',
            'content' => [
                ['type' => 'text', 'text' => $userText],
                ['type' => 'image_url', 'image_url' => [
                    'url'    => "data:{$mime};base64,{$b64}",
                    'detail' => 'high',
                ]],
            ],
        ];
        return $messages;
    }

    protected static function mimeFor(string $ext): string
    {
        switch ($ext) {
            case 'png':  return 'image/png';
            case 'jpg':
            case 'jpeg': return 'image/jpeg';
            case 'webp': return 'image/webp';
            case 'gif':  return 'image/gif';
            default:     return 'application/octet-stream';
        }
    }

    /**
     * Deterministic checks we always run, model-independent.
     *
     * @return array<int,array>
     */
    protected static function deterministicChecks(Bill $bill, ?array $extracted): array
    {
        $issues = [];

        // 1) Bill number must be present.
        if (empty($bill->bill_no)) {
            $issues[] = [
                'code' => 'missing_bill_no', 'field' => 'bill_no',
                'severity' => 'warn', 'message' => 'Bill number is empty on the form.',
                'expected' => null, 'actual' => null,
            ];
        }

        // 2) Value must parse as a positive number.
        $val = is_numeric($bill->value) ? (float) $bill->value : null;
        if ($val === null || $val <= 0) {
            $issues[] = [
                'code' => 'invalid_value', 'field' => 'value',
                'severity' => 'warn',
                'message' => 'Bill value is missing or not a positive number.',
                'expected' => '> 0', 'actual' => $bill->value,
            ];
        }

        // 3) Duplicate invoice number for same supplier.
        if (!empty($bill->bill_no)) {
            $dup = Bill::where('id', '!=', $bill->id)
                ->where('bill_no', $bill->bill_no)
                ->where('supplier', $bill->supplier)
                ->first();
            if ($dup) {
                $issues[] = [
                    'code' => 'duplicate_bill_no', 'field' => 'bill_no',
                    'severity' => 'block',
                    'message' => "Another bill (#{$dup->id}) already exists with the same supplier and bill number.",
                    'expected' => null, 'actual' => $bill->bill_no,
                ];
            }
        }

        // 4) Cross-check extracted values vs form.
        if (is_array($extracted)) {
            // Total mismatch
            $extTotal = is_numeric($extracted['total'] ?? null) ? (float) $extracted['total'] : null;
            if ($extTotal !== null && $val !== null) {
                $diff = abs($extTotal - $val);
                $rel  = $val > 0 ? $diff / $val : 1;
                if ($diff > 1 && $rel > 0.01) {
                    $issues[] = [
                        'code' => 'total_mismatch', 'field' => 'value',
                        'severity' => 'block',
                        'message' => sprintf('Form total (%.2f) does not match invoice total (%.2f).', $val, $extTotal),
                        'expected' => $val, 'actual' => $extTotal,
                    ];
                }
            }

            // Bill number mismatch
            $extBillNo = trim((string) ($extracted['invoice_number'] ?? ''));
            if ($extBillNo !== '' && !empty($bill->bill_no)) {
                if (self::normalize($extBillNo) !== self::normalize((string) $bill->bill_no)) {
                    $issues[] = [
                        'code' => 'bill_no_mismatch', 'field' => 'bill_no',
                        'severity' => 'block',
                        'message' => "Invoice number on document ({$extBillNo}) does not match the form ({$bill->bill_no}).",
                        'expected' => $bill->bill_no, 'actual' => $extBillNo,
                    ];
                }
            }

            // Math: subtotal + vat = total (within 1 unit / 1%)
            $sub = is_numeric($extracted['subtotal'] ?? null) ? (float) $extracted['subtotal'] : null;
            $vat = is_numeric($extracted['vat']      ?? null) ? (float) $extracted['vat']      : null;
            $tot = $extTotal;
            if ($sub !== null && $vat !== null && $tot !== null) {
                $diff = abs(($sub + $vat) - $tot);
                if ($diff > 1) {
                    $issues[] = [
                        'code' => 'math_mismatch', 'field' => 'total',
                        'severity' => 'warn',
                        'message' => sprintf('Subtotal + VAT (%.2f) does not equal total (%.2f) on the invoice.', $sub + $vat, $tot),
                        'expected' => $sub + $vat, 'actual' => $tot,
                    ];
                }
            }

            // Future invoice date
            $extDate = $extracted['invoice_date'] ?? null;
            if ($extDate) {
                try {
                    $d = Carbon::parse($extDate);
                    if ($d->isFuture()) {
                        $issues[] = [
                            'code' => 'future_invoice_date', 'field' => 'invoice_date',
                            'severity' => 'warn',
                            'message' => "Invoice date {$d->toDateString()} is in the future.",
                            'expected' => 'today or earlier', 'actual' => $d->toDateString(),
                        ];
                    }
                } catch (\Throwable $e) { /* ignore */ }
            }
        }

        return $issues;
    }

    protected static function normalize(string $s): string
    {
        return preg_replace('/[\s\-_\/\.]/', '', mb_strtolower($s));
    }

    protected static function overallSeverity(array $findings): string
    {
        $sev = 'ok';
        foreach ($findings as $f) {
            $s = $f['severity'] ?? 'ok';
            if ($s === 'block') return 'block';
            if ($s === 'warn')  $sev = 'warn';
        }
        return $sev;
    }

    protected static function summarizeMessage(string $severity, int $count): string
    {
        if ($severity === 'block') return "Verification found blocking issues ({$count} total).";
        if ($severity === 'warn')  return "Verification found {$count} item(s) to review.";
        if ($count === 0)          return 'No issues detected. Bill matches the attached invoice.';
        return 'Verification passed.';
    }

    protected static function safeJsonDecode(?string $content): array
    {
        if (!$content) return [];
        $j = json_decode($content, true);
        if (is_array($j)) return $j;
        // Sometimes models still wrap json in code fences.
        if (preg_match('/\{[\s\S]*\}/', $content, $m)) {
            $j = json_decode($m[0], true);
            if (is_array($j)) return $j;
        }
        return [];
    }
}
