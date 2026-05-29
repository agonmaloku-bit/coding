<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WorkflowTemplate extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'type',
        'company_id',
        'is_default',
        'is_active',
        'created_by',
    ];

    protected $hidden = [
        'deleted_at',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'is_active' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->created_by = optional(auth()->user())->id;
        });
    }

    public function steps()
    {
        return $this->hasMany(WorkflowStep::class)->orderBy('step_order');
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeWithSteps($query)
    {
        return $query->with('steps.role', 'company', 'createdBy');
    }

    public function getNextStep($currentStepOrder)
    {
        return $this->steps()
            ->where('step_order', '>', $currentStepOrder)
            ->orderBy('step_order')
            ->first();
    }

    public function getStepByOrder($stepOrder)
    {
        return $this->steps()
            ->where('step_order', $stepOrder)
            ->first();
    }

    public function getTotalSteps()
    {
        return $this->steps()->count();
    }
}
