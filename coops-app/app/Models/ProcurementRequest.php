<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProcurementRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'procurement_requests';

    protected $fillable = [
        'title',
        'description',
        'justification',
        'procurement_type',
        'estimated_value',
        'department_id',
        'company_id',
        'created_by',
        'updated_by',
        'assigned_officer',
        'approved_by',
        'status',
        'step',
        'needed_by',
        'approved_at',
        'rejected_at',
        'rejection_reason',
        'notes',
        'outcome_contract_id',
        'outcome_supplier_id',
        'workflow_template_id',
    ];

    protected $hidden = ['deleted_at'];

    protected $casts = [
        'estimated_value' => 'float',
        'needed_by' => 'date',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->created_by = optional(auth()->user())->id ?: 1;
        });
        static::updating(function ($model) {
            $model->updated_by = optional(auth()->user())->id;
        });
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function assignedOfficer()
    {
        return $this->belongsTo(User::class, 'assigned_officer');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function outcomeContract()
    {
        return $this->belongsTo(Contract::class, 'outcome_contract_id');
    }

    public function outcomeSupplier()
    {
        return $this->belongsTo(Supplier::class, 'outcome_supplier_id');
    }

    public function scopeWithRelations($query)
    {
        return $query->with([
            'department',
            'company',
            'createdBy',
            'assignedOfficer',
            'approvedBy',
            'outcomeSupplier',
        ]);
    }
}
