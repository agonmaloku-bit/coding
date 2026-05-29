<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppUserRole extends Model
{
    use HasFactory;

    protected $table = 'app_user_roles';

    protected $fillable = [
        'business_app_id',
        'user_id',
        'role_id',
        'department_id',
        'assigned_by',
    ];

    public function businessApp()
    {
        return $this->belongsTo(BusinessApp::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }
}
