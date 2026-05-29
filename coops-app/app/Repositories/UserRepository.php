<?php

namespace App\Repositories;

use App\Enums\Roles;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Spatie\Permission\Models\Role;

class UserRepository extends BaseRepository implements UserRepositoryInterface
{
    public function __construct(User $model)
    {
        parent::__construct($model);
    }

    public function getAll()
    {
        if (request()->has('page')) {
            return $this->model
                ->with('roles', 'department', 'department.company')
                ->orderByDesc('id')
                //                ->orderByDesc('created_at')
                ->paginate(10);
        }

        return parent::all();
    }

    public function findById($id)
    {
        return $this->model
            ->with(
                'roles',
                'department',
                'company',
                'department.company',
                'roles.permissions',
                'permissions',
                'appRoles.businessApp',
                'appRoles.role',
                'appRoles.department'
            )
            ->whereId($id)
            ->first();
    }

    public function getAllUsersByRoles($roles)
    {
        return $this->model
            ->role($roles)
            ->with('roles', 'department', 'roles.permissions', 'permissions')
            ->orderByDesc('created_at')
            ->paginate(10);
    }
    // public function getAllUsersOfDepartartment($id)
    // {
    //     return $this->model
    //         ->departament($id)
    //         ->with('department')
    //         // ->orderByDesc('created_at')
    //         ->paginate(10);
    // }
    public function getAllUsersByDepartmentIdAndRole($id, $role)
    {
        return $this->model
            ->where('department_id', $id)
            ->role($role)
            ->get();
    }

    public function findUserByIdAndRole($id, $roles)
    {
        return $this->model
            ->whereId($id)
            ->role($roles)
            ->first();
    }
}