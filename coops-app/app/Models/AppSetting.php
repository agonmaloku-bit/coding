<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class AppSetting extends Model
{
    protected $table = 'app_settings';
    protected $fillable = ['key', 'value', 'is_encrypted', 'group'];
    protected $casts = ['is_encrypted' => 'boolean'];

    /**
     * Get a setting value, decrypting if needed.
     */
    public static function get(string $key, $default = null)
    {
        $row = self::where('key', $key)->first();
        if (!$row) return $default;
        if ($row->is_encrypted && $row->value) {
            try { return Crypt::decryptString($row->value); }
            catch (\Throwable $e) { return $default; }
        }
        return $row->value ?? $default;
    }

    /**
     * Get many settings as a key=>value array. Encrypted values are decrypted.
     */
    public static function getMany(array $keys): array
    {
        $rows = self::whereIn('key', $keys)->get();
        $out = [];
        foreach ($rows as $row) {
            if ($row->is_encrypted && $row->value) {
                try { $out[$row->key] = Crypt::decryptString($row->value); }
                catch (\Throwable $e) { $out[$row->key] = null; }
            } else {
                $out[$row->key] = $row->value;
            }
        }
        return $out;
    }

    /**
     * Get all settings in a group (with decrypted values).
     */
    public static function getByGroup(string $group): array
    {
        $rows = self::where('group', $group)->get();
        $out = [];
        foreach ($rows as $row) {
            if ($row->is_encrypted && $row->value) {
                try { $out[$row->key] = Crypt::decryptString($row->value); }
                catch (\Throwable $e) { $out[$row->key] = null; }
            } else {
                $out[$row->key] = $row->value;
            }
        }
        return $out;
    }

    /**
     * Set a setting, encrypting if requested.
     */
    public static function set(string $key, $value, bool $encrypt = false, ?string $group = null): self
    {
        $stored = $value;
        if ($encrypt && $value !== null && $value !== '') {
            $stored = Crypt::encryptString((string) $value);
        }
        return self::updateOrCreate(
            ['key' => $key],
            ['value' => $stored, 'is_encrypted' => $encrypt, 'group' => $group]
        );
    }
}
