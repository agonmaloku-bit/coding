<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BillReport extends Model
{
    protected $table = 'bill_reports';

    protected $fillable = [
        'serial_number',
        'year',
        'sequence',
        'generated_by',
        'file_path',
        'bill_ids',
    ];

    protected $casts = [
        'bill_ids' => 'array',
    ];

    public function generatedBy()
    {
        return $this->belongsTo(User::class, 'generated_by', 'id');
    }

    /**
     * Generate the next serial number for the given year.
     * Returns ['sequence' => int, 'serial_number' => string]
     */
    public static function nextSerial(int $year): array
    {
        $max = static::where('year', $year)->max('sequence') ?? 0;
        $sequence = $max + 1;
        return [
            'sequence'      => $sequence,
            'serial_number' => $year . '/' . str_pad($sequence, 4, '0', STR_PAD_LEFT),
        ];
    }
}
