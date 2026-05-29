<?php

namespace App\Mediators;

use App\Enums\Permissions;
use App\Enums\Roles;
use App\Http\Resources\ResponseResource;
use App\Logic\Departments;
use App\Logic\Permission;
use App\Mediators\Contracts\ProcurementOfficerMediatorInterface;
use App\Models\Role;
use App\Repositories\Contracts\DepartmentRepositoryInterface;
use App\Repositories\Contracts\RoleRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Traits\ResponseJson;

class ProcurementOfficerMediator implements ProcurementOfficerMediatorInterface
{
    use ResponseJson;

    private $userRepository;
    private $departmentRepository;
    private $roleRepository;

    public function __construct(UserRepositoryInterface $userRepository,
                                DepartmentRepositoryInterface $departmentRepository,
                                RoleRepositoryInterface $roleRepository)
    {
        $this->userRepository = $userRepository;
        $this->departmentRepository = $departmentRepository;
        $this->roleRepository = $roleRepository;
    }

    public function getAllProcurementOfficers()
    {
        if (!Permission::hasPermissionTo(Permissions::PROCUREMENT_OFFICER_SHOW))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

//        $roles = $this->roleRepository->getAllRolesForType(Roles::PROCUREMENT_OFFICER);
//
//        return $this->checkIfNullAndReturnResponse($this->userRepository->getAllUsersByRoles($roles));

        $role = Roles::PROCUREMENT_OFFICER;

        return ResponseResource::make($this->userRepository->getAllUsersByRoles($role));
    }

    public function getAllProcurementOfficersByDepartmentId($id)
    {
        if (!Permission::hasPermissionTo(Permissions::PROCUREMENT_OFFICER_SHOW))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

//        $role = Role::where('name', Roles::PROCUREMENT_OFFICER)
//            ->whereHas('departments', function ($query) use ($id) {
//                $query->where('departments.id', '=', $id);
//            })->get();
        $role = Roles::PROCUREMENT_OFFICER;

        return $this->checkIfNullAndReturnResponse($this->userRepository->getAllUsersByDepartmentIdAndRole($id, $role));
    }

    public function findbyId($id)
    {
        if (!Permission::hasPermissionTo(Permissions::PROCUREMENT_OFFICER_SHOW))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

//        $roles = $this->roleRepository->getAllRolesForType(Roles::PROCUREMENT_OFFICER);
//        return $this->checkIfNullAndReturnResponse($this->userRepository->findUserByIdAndRole($id, $roles));

        return ResponseResource::make($this->userRepository->findById($id));
    }

    public function storeProcurementOfficer($request)
    {
        if (!Permission::hasPermissionTo(Permissions::PROCUREMENT_OFFICER_ADD))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

//        $model = $this->userRepository->store($request->all());
//        if (is_null($model))
//        {
//            return $this->errorResponse();
//        }
//
//        $department = $this->departmentRepository->find($request->department_id);
//
//        $role = Departments::getDepartmentAccesor($department->name,Roles::PROCUREMENT_OFFICER);
//        $model->assignRole($role);
//
//        return $this->successResponse($model);

        $user = $this->userRepository->store($request->all());
        if ($user != null) {
            $role = Roles::PROCUREMENT_OFFICER;

            $user->assignRole($role);

            if ($request->input("permissions") != null) {
                $permissionNames = collect($request->input("permissions"))->pluck("name");
                $user->givePermissionTo($permissionNames);
            }
        }
        return ResponseResource::make($user);
    }

    public function updateProcurementOfficerById($request, $id)
    {
        if (!Permission::hasPermissionTo(Permissions::PROCUREMENT_OFFICER_EDIT))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

//        $result = $this->userRepository->update($id, $request->except(['old_email', 'password_confirmation']));
//
//        return $this->checkIfTrueOrFalseAndReturnResponse($result);


        $result = $this->userRepository->update($id, $request->all());
        if ($result === 0) {
            return ResponseResource::make(['success' => false]);
        }
        $user = $this->userRepository->findById($id);
        $permissionNames = collect($request->input("permissions"))->pluck("name");
        $user->syncPermissions($permissionNames);

        return ResponseResource::make(['success' => true]);
    }

    public function deleteProcurementOfficerById($id)
    {
        if (!Permission::hasPermissionTo(Permissions::PROCUREMENT_OFFICER_DELETE))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        $result = $this->userRepository->destroy($id);

        if ($result === 0) {
            ResponseResource::make(['success' => false]);
        }

        ResponseResource::make(['success' => true]);
    }
}
