<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Laravel\Passport\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

/**
 * App\Models\User
 *
 * @property int $id
 * @property string $name
 * @property string $email
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection|\Illuminate\Notifications\DatabaseNotification[] $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection|\Laravel\Sanctum\PersonalAccessToken[] $tokens
 * @property-read int|null $tokens_count
 * @method static \Database\Factories\UserFactory factory(...$parameters)
 * @method static \Illuminate\Database\Eloquent\Builder|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|User query()
 * @method static \Illuminate\Database\Eloquent\Builder|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereUpdatedAt($value)
 * @mixin \Eloquent
 * @property string $first_name
 * @property string $last_name
 * @property string|null $deleted_at
 * @property-read mixed $full_name
 * @method static \Illuminate\Database\Eloquent\Builder|User whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereFirstName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereLastName($value)
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\Contract[] $contracts_assigned
 * @property-read int|null $contracts_assigned_count
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\Contract[] $contracts_created
 * @property-read int|null $contracts_created_count
 * @property-read \Illuminate\Database\Eloquent\Collection|\Spatie\Permission\Models\Permission[] $permissions
 * @property-read int|null $permissions_count
 * @property-read \Illuminate\Database\Eloquent\Collection|\Spatie\Permission\Models\Role[] $roles
 * @property-read int|null $roles_count
 * @method static \Illuminate\Database\Eloquent\Builder|User permission($permissions)
 * @method static \Illuminate\Database\Eloquent\Builder|User role($roles, $guard = null)
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
    use HasRoles, SoftDeletes;
    use \Znck\Eloquent\Traits\BelongsToThrough;


    public $guard_name = 'web';

    /**
     * The attributes that are mass assignable.
     *
     * @var string[]
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'department_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array
     */
    protected $hidden = [
        'password',
        'remember_token',
        //        'created_at',
//        'updated_at',
        'deleted_at'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function setFirstNameAttribute($value)
    {
        $this->attributes['first_name'] = ucfirst($value);
    }

    public function setLastNameAttribute($value)
    {
        $this->attributes['last_name'] = ucfirst($value);
    }

    public function setPasswordAttribute($value)
    {
        if (Hash::needsRehash($value)) {
            $value = Hash::make($value);
        }

        $this->attributes['password'] = $value;
    }

    public function contracts_assigned()
    {
        return $this->hasMany(Contract::class, "responsible_person", "id");
    }

    public function contracts_created()
    {
        return $this->hasMany(Contract::class, "creaated_by", "id");
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
    public function bills_created()
    {
        return $this->hasMany(Bill::class, "created_by", "id");
    }

    public function bcomments()
    {
        return $this->hasMany(BillComments::class);
    }

    public function company()
    {
        return $this->belongsToThrough(Company::class, Department::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function appRoles()
    {
        return $this->hasMany(AppUserRole::class);
    }

//    public static function FromRequest($request){
//        $user = new User();
//        $user->name = $request->input('name');
//        $user->type_id = $request->input('type_id');
//        $user->name_of_contractor = $request->input('name_of_contractor');
//        $user->address = $request->input('address');
//        $user->company_id = $request->input('company_id');
//        $user->deadline_from = $request->input('deadline_from');
//        $user->deadline_to = $request->input('deadline_to');
//        $user->person_id = $request->input('person_id');
//        $user->total_price = $request->input('total_price');
//        $user->unit_price = $request->input('unit_price');
//        $user->payment_date = $request->input('payment_date');
//        $user->payment_terms = $request->input('payment_terms');
//        $user->comment = $request->input('comment');
//        $user->attachments = $request->input('attachments');
//        $user->created_by = $request->input('created_by');
//
//        return $user;
//    }
}