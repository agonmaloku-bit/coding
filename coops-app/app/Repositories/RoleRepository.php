<?php

namespace App\Repositories;

use App\Enums\Roles;
use App\Models\Role;
use App\Repositories\Contracts\RoleRepositoryInterface;

class RoleRepository extends BaseRepository implements RoleRepositoryInterface
{
    public function __construct(Role $model)
    {
        parent::__construct($model);
    }

    public function getAll()
    {
        if (request()->has('page')) {
            return $this->model
                ->with('departments:name')
                ->where("name", "!=", Roles::SUPER_ADMIN)
                ->orderByDesc("id")
                ->paginate(10);
        }

        return parent::all();
    }

    public function findById($id)
    {
        return $this->model
            ->whereId($id)
            ->with("departments", "permissions")
            ->first();
    }

    public function getAllRolesByDepartmentIds($ids)
    {
        return $this->model
            ->whereHas('departments', function ($q) use ($ids) {
                $q->whereIn('id', [$ids]);
            })->get();
    }

    public function getRoleByRoleNameInDepartments($depId, $roleSlug)
    {
        return $this->model
            ->where('slug', $roleSlug)
            ->whereHas('departments', function ($q) use ($depId) {
                $q->whereIn('id', [$depId]);
            })
            ->get();
    }


//    public function getDeparmentsCountForRole($id)
//    {
//        $role = parent::find($id);
//        return $role->departments->count();
//    }

    public function getAllRolesForType($type)
    {
        return Role::where('name', $type)
            ->orWhere('name', 'like', '%' . $type . '%')
            ->get();
    }

//    public function findByName($name)
//    {
//        $role = $this->model->where('name', $name)->orWhere('name', 'like', '%' . $name . '%')->first();
//        $roleName = explode("|", $role->name);
//        $role->name = $roleName[1];
//        return $role;
//    }
}
