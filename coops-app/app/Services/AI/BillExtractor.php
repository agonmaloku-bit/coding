<?php

namespace App\Services\AI;

use Illuminate\Http\UploadedFile;

/**
 * Extracts structured bill fields from an uploaded invoice file
 * (image or PDF) using OpenAI vision. Used by the "Add bill" form
 * to pre-fill supplier/bill_no/value/description/date.
 *
 * Stateless — does not persist anything, just returns the extracted
 * fields plus a human readable message and a severity flag the UI
 * can use to colour the result panel.
 */
class BillExtractor
{
    public const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
    public const ALLOWED_EXTS = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'pdf'];

    /**
     * @return array{ok:bool, severity:string, message:?string, extracted:?array, raw:?array, error:?string}
     */
    public static function extract(UploadedFile $file): array
    {
        if (!OpenAiClient::isConfigured()) {
            return [
                'ok'        => false,
                'severity'  => 'error',
                'message'   => 'AI is not configured. Ask a Super Admin to set the OpenAI API key under Management → AI Settings.',
                'extracted' => null,
                'raw'       => null,
                'error'     => 'not_configured',
            ];
        }

        $ext = strtolower($file->getClientOriginalExtension() ?: $file->extension());
        if (!in_array($ext, self::ALLOWED_EXTS, true)) {
            return [
                'ok'        => false,
                'severity'  => 'error',
                'message'   => "Unsupported file type: .{$ext}. Use jpg, png, webp, gif or pdf.",
                'extracted' => null,
                'raw'       => null,
                'error'     => 'unsupported_ext',
            ];
        }

        $size = $file->getSize();
        if ($size === false || $size > self::MAX_IMAGE_BYTES) {
            return [
                'ok'        => false,
                'severity'  => 'error',
                'message'   => 'File is too large to send to the AI (max 8 MB).',
                'extracted' => null,
                'raw'       => null,
                'error'     => 'too_large',
            ];
        }

        $isPdf = $ext === 'pdf';
        $renderedPages = $isPdf ? PdfRenderer::renderPages($file->getRealPath()) : [];
        $messages = self::buildMessages($file->getRealPath(), $ext, $isPdf, $renderedPages);

        $resp = OpenAiClient::chat($messages, [
            'response_format' => ['type' => 'json_object'],
            'temperature'     => 0,
            'max_tokens'      => 1200,
        ]);

        if (!empty($renderedPages)) {
            PdfRenderer::cleanupFor($renderedPages);
        }

        if (!$resp['ok']) {
            return [
                'ok'        => false,
                'severity'  => 'error',
                'message'   => $resp['error'] ?? 'AI request failed.',
                'extracted' => null,
                'raw'       => $resp,
                'error'     => $resp['error'] ?? 'request_failed',
            ];
        }

        $parsed = self::safeJsonDecode($resp['content']);

        $extracted = is_array($parsed['extracted'] ?? null) ? $parsed['extracted'] : null;
        if (!$extracted) {
            return [
                'ok'        => false,
                'severity'  => 'warn',
                'message'   => $isPdf
                    ? 'Could not extract structured data from this PDF. Try uploading a clear photo or scan instead.'
                    : 'AI could not extract any fields from this file. Try a clearer image.',
                'extracted' => null,
                'raw'       => $resp,
                'error'     => 'no_extraction',
            ];
        }

        // Normalize the extracted record into the keys the front-end form uses.
        $normalized = self::normalizeForForm($extracted);

        return [
            'ok'        => true,
            'severity'  => $isPdf ? 'warn' : 'ok',
            'message'   => $isPdf
                ? 'Extracted from PDF (text only). Please double-check the values.'
                : 'Fields extracted from the file. Review and adjust before saving.',
            'extracted' => $normalized,
            'raw'       => null,
            'error'     => null,
        ];
    }

    protected static function buildMessages(string $absPath, string $ext, bool $isPdf, array $renderedPages = []): array
    {
        $system = <<<TXT
You are an invoice data extraction assistant. Read the attached invoice and
return its key fields as JSON. Respond ONLY with valid JSON, no prose, no
markdown. Schema:

{
  "extracted": {
    "supplier": string|null,        // supplier / vendor display name
    "bill_no": string|null,         // invoice number / bill number
    "invoice_date": string|null,    // ISO YYYY-MM-DD if possible
    "currency": string|null,        // ISO code if possible (EUR, USD)
    "subtotal": number|null,
    "vat": number|null,
    "total": number|null,           // grand total (the value the user pays)
    "iban": string|null,
    "tax_id": string|null,          // VAT/Tax ID of the supplier
    "description": string|null,     // 1 short line summarising what was billed
    "line_items": [
      { "description": string, "qty": number|null, "unit_price": number|null, "total": number|null }
    ]
  }
}

Rules:
- Numbers must be numeric, not strings. Use null if not visible.
- description should be a short human readable summary (e.g. "Office supplies — March 2026"),
  derived from the line items if present.
- Never invent data. If a field is unreadable or missing, return null.
TXT;

        $userText = "Extract the structured fields from this invoice.";

        $messages = [['role' => 'system', 'content' => $system]];

        if ($isPdf) {
            if (!empty($renderedPages)) {
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
            // Fallback: render failed.
            $messages[] = [
                'role'    => 'user',
                'content' => $userText
                    . "\n\nNote: the attachment is a PDF and could not be visually decoded. "
                    . "Set every extracted field to null and return an empty line_items array.",
            ];
            return $messages;
        }

        $b64  = base64_encode(file_get_contents($absPath));
        $mime = self::mimeFor($ext);
        $messages[] = [
            'role'    => 'user',
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
     * Map the AI response keys onto the keys the front-end Add Bill form uses.
     */
    protected static function normalizeForForm(array $e): array
    {
        $supplier    = self::s($e['supplier'] ?? null);
        $billNo      = self::s($e['bill_no'] ?? $e['invoice_number'] ?? null);
        $date        = self::s($e['invoice_date'] ?? null);
        $currency    = self::s($e['currency'] ?? null);
        $total       = self::n($e['total'] ?? null);
        $subtotal    = self::n($e['subtotal'] ?? null);
        $vat         = self::n($e['vat'] ?? null);
        $iban        = self::s($e['iban'] ?? null);
        $taxId       = self::s($e['tax_id'] ?? null);
        $description = self::s($e['description'] ?? null);
        $lines       = is_array($e['line_items'] ?? null) ? $e['line_items'] : [];

        // Build a fallback description from line items if the model didn't.
        if (!$description && !empty($lines)) {
            $first = $lines[0]['description'] ?? null;
            if ($first) {
                $description = count($lines) > 1
                    ? trim($first) . ' (+' . (count($lines) - 1) . ' more)'
                    : trim($first);
            }
        }

        return [
            'supplier'     => $supplier,
            'bill_no'      => $billNo,
            'invoice_date' => $date,
            'currency'     => $currency,
            'value'        => $total,        // the form's "value" field === invoice total
            'subtotal'     => $subtotal,
            'vat'          => $vat,
            'iban'         => $iban,
            'tax_id'       => $taxId,
            'description'  => $description,
            'line_items'   => $lines,
        ];
    }

    protected static function s($v): ?string
    {
        if ($v === null) return null;
        $v = trim((string) $v);
        return $v === '' ? null : $v;
    }

    protected static function n($v): ?float
    {
        if ($v === null || $v === '') return null;
        if (is_numeric($v)) return (float) $v;
        // Strip currency symbols / spaces, normalize commas.
        $clean = preg_replace('/[^0-9,\.\-]/', '', (string) $v);
        // If both . and , present, assume , is thousands separator.
        if (strpos($clean, '.') !== false && strpos($clean, ',') !== false) {
            $clean = str_replace(',', '', $clean);
        } else {
            $clean = str_replace(',', '.', $clean);
        }
        return is_numeric($clean) ? (float) $clean : null;
    }

    protected static function safeJsonDecode(?string $content): array
    {
        if (!$content) return [];
        $decoded = json_decode($content, true);
        if (is_array($decoded)) return $decoded;
        // Strip markdown code fences if the model wrapped the JSON.
        if (preg_match('/\{.*\}/s', $content, $m)) {
            $decoded = json_decode($m[0], true);
            if (is_array($decoded)) return $decoded;
        }
        return [];
    }
}
