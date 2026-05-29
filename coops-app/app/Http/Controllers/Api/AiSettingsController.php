<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ResponseResource;
use App\Models\AppSetting;
use App\Services\AI\OpenAiClient;
use Illuminate\Http\Request;

/**
 * Manages tenant-level AI provider settings (currently OpenAI).
 * Only Super Admins should hit this controller — guarded by the route group
 * + a permission check below.
 */
class AiSettingsController extends Controller
{
    public const PUBLIC_KEYS = [
        OpenAiClient::KEY_ENABLED,
        OpenAiClient::KEY_BASE_URL,
        OpenAiClient::KEY_MODEL,
        OpenAiClient::KEY_VISION,
    ];

    public const ALL_KEYS = [
        OpenAiClient::KEY_ENABLED,
        OpenAiClient::KEY_API_KEY,
        OpenAiClient::KEY_BASE_URL,
        OpenAiClient::KEY_MODEL,
        OpenAiClient::KEY_VISION,
    ];

    /**
     * Return current settings (api_key is masked).
     */
    public function index(Request $request)
    {
        $this->authorizeSuperAdmin($request);

        $values = AppSetting::getMany(self::ALL_KEYS);
        $apiKey = (string) ($values[OpenAiClient::KEY_API_KEY] ?? '');
        return ResponseResource::make([
            'data' => [
                'enabled'        => filter_var($values[OpenAiClient::KEY_ENABLED] ?? false, FILTER_VALIDATE_BOOLEAN),
                'base_url'       => $values[OpenAiClient::KEY_BASE_URL] ?: OpenAiClient::DEFAULT_BASE_URL,
                'model'          => $values[OpenAiClient::KEY_MODEL] ?: OpenAiClient::DEFAULT_MODEL,
                'vision_enabled' => filter_var($values[OpenAiClient::KEY_VISION] ?? true, FILTER_VALIDATE_BOOLEAN),
                'api_key_set'    => $apiKey !== '',
                'api_key_hint'   => $apiKey !== '' ? ('…' . substr($apiKey, -4)) : null,
            ],
        ]);
    }

    /**
     * Save settings. The api_key is only updated if a new value is provided
     * (so re-saving the form without retyping the key keeps the existing one).
     */
    public function update(Request $request)
    {
        $this->authorizeSuperAdmin($request);

        $data = $request->validate([
            'enabled'        => 'sometimes|boolean',
            'base_url'       => 'nullable|string|max:255|url',
            'model'          => 'nullable|string|max:100',
            'vision_enabled' => 'sometimes|boolean',
            'api_key'        => 'nullable|string|max:255',
        ]);

        if (array_key_exists('enabled', $data)) {
            AppSetting::set(OpenAiClient::KEY_ENABLED, $data['enabled'] ? '1' : '0', false, OpenAiClient::GROUP);
        }
        if (array_key_exists('base_url', $data)) {
            AppSetting::set(OpenAiClient::KEY_BASE_URL, $data['base_url'] ?: OpenAiClient::DEFAULT_BASE_URL, false, OpenAiClient::GROUP);
        }
        if (array_key_exists('model', $data)) {
            AppSetting::set(OpenAiClient::KEY_MODEL, $data['model'] ?: OpenAiClient::DEFAULT_MODEL, false, OpenAiClient::GROUP);
        }
        if (array_key_exists('vision_enabled', $data)) {
            AppSetting::set(OpenAiClient::KEY_VISION, $data['vision_enabled'] ? '1' : '0', false, OpenAiClient::GROUP);
        }
        if (!empty($data['api_key'])) {
            AppSetting::set(OpenAiClient::KEY_API_KEY, $data['api_key'], true, OpenAiClient::GROUP);
        }

        return $this->index($request);
    }

    /**
     * Quick connectivity test — does a 1-token round-trip to verify the key.
     */
    public function test(Request $request)
    {
        $this->authorizeSuperAdmin($request);
        $r = OpenAiClient::ping();
        return ResponseResource::make([
            'data' => [
                'ok'      => $r['ok'],
                'message' => $r['message'],
            ],
        ]);
    }

    protected function authorizeSuperAdmin(Request $request): void
    {
        $user = $request->user();
        if (!$user) abort(401);
        if (!method_exists($user, 'hasRole') || !$user->hasRole('Super Admin')) {
            abort(403, 'Super Admin only.');
        }
    }
}
