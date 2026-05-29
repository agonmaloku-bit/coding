<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BusinessApp extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'key',
        'name',
        'icon',
        'route_path',
        'color',
        'description',
        'is_existing',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_existing' => 'boolean',
        'is_active' => 'boolean',
    ];

    protected $hidden = [
        'deleted_at',
    ];

    public function userRoles()
    {
        return $this->hasMany(AppUserRole::class);
    }
}
