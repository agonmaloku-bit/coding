<?php

namespace App\Mediators;

use App\Enums\Permissions;
use App\Enums\Roles;
use App\Http\Resources\ResponseResource;
use App\Logic\Permission;
use App\Mediators\Contracts\ResponsiblePersonMediatorInterface;
use App\Models\Contract;
use App\Models\Role;
use App\Repositories\Contracts\DepartmentRepositoryInterface;
use App\Repositories\Contracts\RoleRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Traits\ResponseJson;

class ResponsiblePersonMediator implements ResponsiblePersonMediatorInterface
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

    public function getAllResponsiblePersons()
    {
        if (!Permission::hasPermissionTo([Permissions::RESPONSIBLE_PERSON_SHOW, Permissions::CONTRACT_APPROVE, Permissions::CONTRACT_REQUEST]))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

//        $roles = $this->roleRepository->getAllRolesForType(Roles::RESPONSIBLE_PERSON);

//        return $this->checkIfNullAndReturnResponse($this->userRepository->getAllUsersByRoles($roles));

        $role = Roles::RESPONSIBLE_PERSON;

        return ResponseResource::make($this->userRepository->getAllUsersByRoles($role));
    }

    public function getAllResponsiblePersonsByDepartmentId($id)
    {
        if (!Permission::hasPermissionTo([Permissions::RESPONSIBLE_PERSON_SHOW, Permissions::CONTRACT_APPROVE, Permissions::CONTRACT_REQUEST]))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }
//        $department = $this->departmentRepository->find($id);
//        $role = Departments::getDepartmentAccesor($department->name,Roles::RESPONSIBLE_PERSON);
//
//        return $this->checkIfNullAndReturnResponse($this->userRepository->getAllUsersByDepartmentIdAndRole($id, $role));

        $role = [Roles::RESPONSIBLE_PERSON, Roles::DIRECTOR_DEPARTMENT];

//        $responsible_users = Role::where('name', $role)
//            ->whereHas('departments', function ($query) use ($id) {
//                $query->where('departments.id', '=', $id);
//            })->get();

        return ResponseResource::make($this->userRepository->getAllUsersByDepartmentIdAndRole($id, $role));
    }

    public function findbyId($id)
    {
        if (!Permission::hasPermissionTo(Permissions::RESPONSIBLE_PERSON_SHOW))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

//        $roles = $this->roleRepository->getAllRolesForType(Roles::RESPONSIBLE_PERSON);
//        return $this->checkIfNullAndReturnResponse($this->userRepository->findUserByIdAndRole($id, $roles));

        return ResponseResource::make($this->userRepository->findById($id));
    }

    public function storeResponsiblePerson($request)
    {
        if (!Permission::hasPermissionTo(Permissions::RESPONSIBLE_PERSON_ADD))
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
//        $role = Departments::getDepartmentAccesor($department->name,Roles::RESPONSIBLE_PERSON);
//        $model->assignRole($role);
//
//        return $this->successResponse($model);

        $user = $this->userRepository->store($request->all());
        if ($user != null) {
            $role = Roles::RESPONSIBLE_PERSON;

            $user->assignRole($role);

            if ($request->input("permissions") != null) {
                $permissionNames = collect($request->input("permissions"))->pluck("name");
                $user->givePermissionTo($permissionNames);
            }
        }
        return ResponseResource::make($user);
    }

    public function updateResponsiblePersonById($request, $id)
    {
        if (!Permission::hasPermissionTo(Permissions::RESPONSIBLE_PERSON_EDIT))
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

        //$roleNames = collect($request->input("roles"))->pluck("name");
        $user = $this->userRepository->findById($id);
//        $user->syncRoles($roleNames);

        $permissionNames = collect($request->input("permissions"))->pluck("name");
        $user->syncPermissions($permissionNames);

        return ResponseResource::make(['success' => true]);
    }

    public function deleteResponsiblePersonById($id)
    {
        if (!Permission::hasPermissionTo(Permissions::RESPONSIBLE_PERSON_DELETE))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }
//        $roles = $this->roleRepository->getAllRolesForType(Roles::RESPONSIBLE_PERSON);
//        $user = $this->userRepository->findUserByIdAndRole($id, $roles);

        $result = $this->userRepository->destroy($id);

        if ($result === 0) {
            ResponseResource::make(['success' => false]);
        }

        ResponseResource::make(['success' => true]);
    }
}
