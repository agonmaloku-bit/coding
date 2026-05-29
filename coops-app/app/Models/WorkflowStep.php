<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Permission\Models\Role;

class WorkflowStep extends Model
{
    use HasFactory;

    protected $fillable = [
        'workflow_template_id',
        'step_order',
        'name',
        'role_id',
        'notify_roles',
        'description',
    ];

    protected $casts = [
        'notify_roles' => 'array',
    ];

    public function workflowTemplate()
    {
        return $this->belongsTo(WorkflowTemplate::class);
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }
}
