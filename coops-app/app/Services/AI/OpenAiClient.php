<?php

namespace App\Services\AI;

use App\Models\AppSetting;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;

/**
 * Thin wrapper around the OpenAI Chat Completions API.
 * Reads provider config from app_settings (group: "ai").
 */
class OpenAiClient
{
    public const GROUP = 'ai';

    public const KEY_ENABLED   = 'ai.enabled';
    public const KEY_API_KEY   = 'ai.openai.api_key';
    public const KEY_BASE_URL  = 'ai.openai.base_url';
    public const KEY_MODEL     = 'ai.openai.model';
    public const KEY_VISION    = 'ai.openai.vision_enabled';

    public const DEFAULT_BASE_URL = 'https://api.openai.com/v1';
    public const DEFAULT_MODEL    = 'gpt-4o-mini';

    public static function config(): array
    {
        $cfg = AppSetting::getByGroup(self::GROUP);
        return [
            'enabled'        => filter_var($cfg[self::KEY_ENABLED] ?? false, FILTER_VALIDATE_BOOLEAN),
            'api_key'        => $cfg[self::KEY_API_KEY] ?? null,
            'base_url'       => $cfg[self::KEY_BASE_URL] ?: self::DEFAULT_BASE_URL,
            'model'          => $cfg[self::KEY_MODEL] ?: self::DEFAULT_MODEL,
            'vision_enabled' => filter_var($cfg[self::KEY_VISION] ?? true, FILTER_VALIDATE_BOOLEAN),
        ];
    }

    public static function isConfigured(): bool
    {
        $c = self::config();
        return $c['enabled'] && !empty($c['api_key']);
    }

    /**
     * Call chat completions.
     *
     * @param array $messages   OpenAI messages array (role/content).
     * @param array $opts       extra options (model, response_format, max_tokens, temperature)
     * @return array{ok:bool,content:?string,raw:?array,error:?string,usage:?array}
     */
    public static function chat(array $messages, array $opts = []): array
    {
        $cfg = self::config();
        if (empty($cfg['api_key'])) {
            return ['ok' => false, 'content' => null, 'raw' => null, 'error' => 'AI is not configured (missing API key).', 'usage' => null];
        }

        $payload = [
            'model'    => $opts['model']    ?? $cfg['model'],
            'messages' => $messages,
        ];
        if (isset($opts['response_format'])) $payload['response_format'] = $opts['response_format'];
        if (isset($opts['max_tokens']))      $payload['max_tokens']      = $opts['max_tokens'];
        if (isset($opts['temperature']))     $payload['temperature']     = $opts['temperature'];

        $client = new Client([
            'base_uri' => rtrim($cfg['base_url'], '/') . '/',
            'timeout'  => 90,
        ]);

        try {
            $resp = $client->post('chat/completions', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $cfg['api_key'],
                    'Content-Type'  => 'application/json',
                ],
                'json' => $payload,
            ]);
            $body = json_decode((string) $resp->getBody(), true);
            $content = $body['choices'][0]['message']['content'] ?? null;
            return [
                'ok'      => true,
                'content' => $content,
                'raw'     => $body,
                'error'   => null,
                'usage'   => $body['usage'] ?? null,
            ];
        } catch (GuzzleException $e) {
            $errBody = method_exists($e, 'getResponse') && $e->getResponse()
                ? (string) $e->getResponse()->getBody()
                : '';
            return [
                'ok'      => false,
                'content' => null,
                'raw'     => $errBody ? json_decode($errBody, true) : null,
                'error'   => $e->getMessage() . ($errBody ? ' :: ' . substr($errBody, 0, 500) : ''),
                'usage'   => null,
            ];
        }
    }

    /**
     * Quick connectivity test — returns ['ok'=>bool, 'message'=>string].
     */
    public static function ping(): array
    {
        $r = self::chat(
            [['role' => 'user', 'content' => 'Reply with the single word OK.']],
            ['max_tokens' => 5, 'temperature' => 0]
        );
        if (!$r['ok']) return ['ok' => false, 'message' => $r['error'] ?: 'Unknown error.'];
        return ['ok' => true, 'message' => trim((string) $r['content'])];
    }
}
