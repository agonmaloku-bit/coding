<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * App\Models\Contract
 *
 * @method static \Illuminate\Database\Eloquent\Builder|Contract newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Contract newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Contract query()
 * @mixin \Eloquent
 * @property int $id
 * @property string $name
 * @property int $type_id
 * @property string $name_of_contractor
 * @property string $address
 * @property int $company_id
 * @property string $deadline_from
 * @property string|null $deadline_to
 * @property int $person_id
 * @property int $total_price
 * @property int $unit_price
 * @property string $payment_date
 * @property string $payment_terms
 * @property string|null $contractor_obligations
 * @property string|null $company_obligations
 * @property string $comment
 * @property string $attachments
 * @property \App\Models\User $created_by
 * @property string|null $deleted_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Company $company
 * @property-read \App\Models\User $person
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\Status[] $statuses
 * @property-read int|null $statuses_count
 * @property-read \App\Models\ContractType $type
 * @method static \Illuminate\Database\Eloquent\Builder|Contract whereAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Contract whereAttachments($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Contract whereComment($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Contract whereCompanyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Contract whereCompanyObligations($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Contract whereContractorObligations($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Contract whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Contract whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Contract whereDeadlineFrom($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Contract whereDeadlineTo($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Contract whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Contract whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Contract whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Contract whereNameOfContractor($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Contract wherePaymentDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Contract wherePaymentTerms($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Contract wherePersonId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Contract whereTotalPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Contract whereTypeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Contract whereUnitPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Contract whereUpdatedAt($value)
 */
class Contract extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'serial_number',
        'name',
        'contract_type_id',
        'name_of_contractor',
        'address',
        // 'purpose_contractor',
//        'company_id',
        'deadline_from',
        'deadline_to',
        'notify_me',
        'responsible_person',
        'total_price',
        'unit_price',
        'payment_date',
        'payment_terms',
        'contractor_obligations',
        'company_obligations',
        'created_by',
        'department_id',
        'status',
        'step',
        'workflow_template_id',
        'supplier_id',
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
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($query) {
            $query->created_by = optional(auth()->user())->id ?: "1";
            if ($query->max('serial_number') <= 1000000000)
            {
                $query->serial_number = 1000000000 + 1;
            }
            else {
                $query->serial_number = $query->max('serial_number') + 1;
            }
//            $query->serial_number = random_int(1000000000, 9999999999);
        });
    }

    public function setSerialNumber($value)
    {
        $this->attributes['serial_number'] = 1000000000 + 1;
    }

    public function setNameAttribute($value)
    {
        $this->attributes['name'] = ucfirst($value);
    }

    public function setNameOfContractorAttribute($value)
    {
        $this->attributes['name_of_contractor'] = ucwords($value);
    }

    public function setAddressAttribute($value)
    {
        $this->attributes['address'] = ucfirst($value);
    }

    public function setDeadlineFromAttribute($value)
    {
        $this->attributes['deadline_from'] = Carbon::parse($value)->format('Y-m-d H:i:s');
    }

    public function setDeadlineToAttribute($value)
    {
        $this->attributes['deadline_to'] = is_null($value) || empty($value) || $value == "null" ? NULL : Carbon::parse($value);
    }

//    public function setTotalPriceAttribute($value)
//    {
//        $this->attributes['total_price'] = $value * 100;
//    }
//
//    public function setUnitPriceAttribute($value)
//    {
//        $this->attributes['unit_price'] = $value * 100;
//    }

//    public function getTotalPriceAttribute($value)
//    {
//        return $value / 100;
//    }
//
//    public function getUnitPriceAttribute($value)
//    {
//        return $value / 100;
//    }

    public function setPaymentDateAttribute($value)
    {
        $this->attributes['payment_date'] = Carbon::parse($value)->format('Y-m-d H:i:s');
    }

    public function setContractorObligationsAttribute($value)
    {
        $this->attributes['contractor_obligations'] = ucfirst($value);
    }

    public function setCompanyObligationsAttribute($value)
    {
        $this->attributes['company_obligations'] = ucfirst($value);
    }

    public function contract_type()
    {
        return $this->belongsTo(ContractType::class, "contract_type_id");
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function responsiblePerson()
    {
        return $this->belongsTo(User::class, "responsible_person", "id");
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, "created_by", "id");
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function workflowTemplate()
    {
        return $this->belongsTo(WorkflowTemplate::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function files()
    {
        return $this->hasMany(File::class)->withTrashed();
    }

    public function withTables()
    {
        return $this->with('contract_type',
//            'company',
            'responsiblePerson.department.company',
            'createdBy.department.company',
            'department',
            'supplier',
            'comments.user',
            'files.user',
            'workflowTemplate.steps.role');
    }

//    public static function FromRequest($request){
//        $contract = new Contract();
//        $contract->name = $request->input('name');
//        $contract->type_id = $request->input('type_id');
//        $contract->name_of_contractor = $request->input('name_of_contractor');
//        $contract->address = $request->input('address');
//        $contract->company_id = $request->input('company_id');
//        $contract->deadline_from = $request->input('deadline_from');
//        $contract->deadline_to = $request->input('deadline_to');
//        $contract->person_id = $request->input('person_id');
//        $contract->total_price = $request->input('total_price');
//        $contract->unit_price = $request->input('unit_price');
//        $contract->payment_date = $request->input('payment_date');
//        $contract->payment_terms = $request->input('payment_terms');
//        $contract->comment = $request->input('comment');
//        $contract->attachments = $request->input('attachments');
//        $contract->created_by = $request->input('created_by');
//
//        return $contract;
//    }
}
