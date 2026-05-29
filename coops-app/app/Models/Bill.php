<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * App\Models\Bill
 *
 * @method static \Illuminate\Database\Eloquent\Builder|Bill newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Bill newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Bill query()
 * @mixin \Eloquent
 * @property int $id
 * @property string $name
 * @property string $type
 * @property string $value
 * @property string $bill_no
 * @property int $person_id
 * @property string $description
 * @property string $comment
 * @property string $attachments
 * @property \App\Models\User $created_by
 * @property \App\Models\User $assigned_dep_id
 * @property \App\Models\Supplier $supplier
 * @property string|null $deleted_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Company $company
 * @property-read \App\Models\User $person
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\Status[] $statuses
 * @property-read int|null $statuses_count
 * @method static \Illuminate\Database\Eloquent\Builder|Bill whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Bill whereAttachments($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Bill whereComment($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Bill whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Bill whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Bill whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Bill whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Bill whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Bill wherePersonId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Bill whereValue($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Bill whereUpdatedAt($value)
 */

class Bill extends Model
{
    use HasFactory, SoftDeletes;
    protected $table = 'bills';
    protected $fillable = [
        // 'name',
        'type',
        'value',
        'bill_no',
        'supplier',
        'description',
        // 'ordered',
        // 'accepted',
        // 'comment',
        // 'file_upload',
        'created_by',
        'updated_by',
        'assigned_dep_id',
        'step',
        'status',
        'approved_first',
        'approved_second',
        'workflow_template_id',
        'contract_id',
        // 'approved_third',

    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array
     */

    protected $hidden = [
        //        'created_at',
        //        'updated_at',
        'deleted_at',
    ];

    /**
     * The "booting" method of the model.
     *
     * @return void
     */
    public function setNameAttribute($value)
    {
        $this->attributes['name'] = ucfirst($value);
    }

    public function setType($value)
    {
        $this->attributes['type'] = ucfirst($value);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, "created_by", "id");
    }
    public function updatedBy()
    {
        return $this->belongsTo(User::class, "updated_by", "id");
    }

    public function supplierName()
    {
        return $this->belongsTo(Supplier::class, "supplier", "id");
    }

    public function departmentName()
    {
        return $this->belongsTo(Department::class, "assigned_dep_id", "id");
    }

    public function workflowTemplate()
    {
        return $this->belongsTo(WorkflowTemplate::class);
    }

    public function contract()
    {
        return $this->belongsTo(Contract::class);
    }

    public function comments()
    {
        return $this->hasMany(BillComments::class);
    }

    public function files()
    {
        return $this->hasMany(BillFiles::class);
        // return $this->hasMany(BillFiles::class)->withTrashed();
    }

    public function withTables()
    {
        return $this->with(
            'comments.user',
            'files',
            'workflowTemplate.steps.role'
        );
    }
}
