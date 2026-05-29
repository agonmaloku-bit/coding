<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContractTemplate extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'contract_type_id',
        'content',
        'file_path',
    ];

    protected $hidden = [
        'deleted_at',
    ];

    public function contractType()
    {
        return $this->belongsTo(ContractType::class);
    }
}
