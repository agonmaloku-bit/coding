<?php

namespace App\Mediators;

use App\Enums\Permissions;
use App\Http\Resources\ResponseResource;
use App\Logic\Permission;
use App\Repositories\Contracts\DepartmentRepositoryInterface;
use App\Repositories\Contracts\RoleRepositoryInterface;
use App\Mediators\Contracts\RoleMediatorInterface;

class RoleMediator implements RoleMediatorInterface
{
    private $roleRepository;
    private $departmentRepository;

    public function __construct(RoleRepositoryInterface       $roleRepository,
                                DepartmentRepositoryInterface $departmentRepository)
    {
        $this->roleRepository = $roleRepository;
        $this->departmentRepository = $departmentRepository;
    }

    public function getAll()
    {
        if (!Permission::hasPermissionTo(Permissions::ROLES_SHOW))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        return ResponseResource::make($this->roleRepository->getAll());
    }

    public function findById($id)
    {
        if (!Permission::hasPermissionTo(Permissions::ROLES_SHOW))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        return ResponseResource::make($this->roleRepository->findById($id));
    }

    public function getAllRolesByDepartmentIds($ids)
    {
        if (!Permission::hasPermissionTo(Permissions::ROLES_SHOW))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        return ResponseResource::make($this->roleRepository->getAllRolesByDepartmentIds($ids));
    }

    public function getRoleByRoleNameInDepartments($depId, $roleName)
    {
        if (!Permission::hasPermissionTo(Permissions::ROLES_SHOW))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        return ResponseResource::make($this->roleRepository->getRoleByRoleNameInDepartments($depId, $roleName));
    }

    public function storeRole($request)
    {
        if (!Permission::hasPermissionTo(Permissions::ROLES_EDIT))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        $role = $this->roleRepository->store($request->all());
        if ($role != null && $request->has("departments"))
        {
            $departments = collect($request->input("departments"));
            $role->departments()->attach($departments->pluck("id"));
        }
        if ($role != null &&  $request->input("permissions") != null) {
            $permissionNames = collect($request->input("permissions"))->pluck("name");
            $role->givePermissionTo($permissionNames);
        }
        return ResponseResource::make($role);
    }

    public function updateRoleById($request, $id)
    {
        if (!Permission::hasPermissionTo(Permissions::ROLES_EDIT))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        $result = $this->roleRepository->update($id, $request->all());
        if ($result === 0) {
            return ResponseResource::make(['success' => false]);
        }
        if ($request->has("departments"))
        {
            $departments = collect($request->input("departments"));
            $role = $this->roleRepository->find($id);
            $role->departments()->sync($departments->pluck("id"));
        }
        if ($request->has("permissions")) {
            $permissionNames = collect($request->input("permissions"))->pluck("name");
            $role->syncPermissions($permissionNames);
        }
        return ResponseResource::make(['success' => true]);
    }

    public function deleteRoleById($id)
    {
        if (!Permission::hasPermissionTo(Permissions::ROLES_EDIT))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        $result = $this->roleRepository->destroy($id);
        if ($result === 0) {
            return ResponseResource::make(['success' => false]);
        }
        return ResponseResource::make(['success' => true]);
    }
}
