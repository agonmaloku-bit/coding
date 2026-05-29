<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BillAiCheck extends Model
{
    protected $table = 'bill_ai_checks';
    protected $fillable = [
        'bill_id', 'model', 'severity', 'findings', 'raw_response',
        'user_id', 'input_tokens', 'output_tokens',
    ];
    protected $casts = [
        'findings' => 'array',
    ];

    public function bill()
    {
        return $this->belongsTo(Bill::class, 'bill_id', 'id');
    }
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
