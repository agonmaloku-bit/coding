<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ArbkController extends Controller
{
    private string $scraperUrl;

    public function __construct()
    {
        $this->scraperUrl = config('services.arbk_scraper_url', 'http://127.0.0.1:8181');
    }

    /**
     * Look up a Kosovo business by NUI (Numri Unik Identifikues).
     *
     * GET /api/arbk/lookup?business_number=123456789
     */
    public function lookup(Request $request)
    {
        $request->validate([
            'business_number' => 'required|string|max:50',
        ]);

        $nui = trim($request->query('business_number'));

        try {
            $response = Http::timeout(90)
                ->get("{$this->scraperUrl}/lookup", ['nui' => $nui]);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            if ($response->status() === 404) {
                return response()->json(['error' => 'Business not found in ARBK registry'], 404);
            }

            Log::warning('ARBK scraper returned error', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);

            return response()->json(['error' => 'ARBK lookup failed'], 502);
        } catch (\Exception $e) {
            Log::error('ARBK scraper unreachable', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'ARBK service unavailable'], 503);
        }
    }
}
