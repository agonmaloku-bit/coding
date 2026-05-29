<?php

namespace App\Mediators;

use App\Enums\Permissions;
use App\Enums\Roles;
use App\Http\Resources\ResponseResource;
use App\Logic\Permission;
use App\Mediators\Contracts\ExecutiveDirectorMediatorInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Traits\ResponseJson;

class ExecutiveDirectorMediator implements ExecutiveDirectorMediatorInterface
{
    use ResponseJson;

    private $userRepository;

    public function __construct(UserRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function getAllExecutiveDirectors()
    {
        if (!Permission::hasPermissionTo(Permissions::EXECUTIVE_DIRECTOR_SHOW))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

//        return $this->checkIfNullAndReturnResponse($this->userRepository->getAllUsersByRoles(Roles::EXECUTIVE_DIRECTOR));

        $role = Roles::EXECUTIVE_DIRECTOR;

        return ResponseResource::make($this->userRepository->getAllUsersByRoles($role));
    }

    public function findbyId($id)
    {
        if (!Permission::hasPermissionTo(Permissions::EXECUTIVE_DIRECTOR_SHOW))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

//        return $this->checkIfNullAndReturnResponse($this->userRepository->findUserByIdAndRole($id, Roles::EXECUTIVE_DIRECTOR));

        return ResponseResource::make($this->userRepository->findById($id));
    }

    public function storeExecutiveDirector($request)
    {
        if (!Permission::hasPermissionTo(Permissions::EXECUTIVE_DIRECTOR_ADD))
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
//        $model->assignRole(Roles::EXECUTIVE_DIRECTOR);
//
//        return $this->successResponse($model);


        $user = $this->userRepository->store($request->all());
        if ($user != null) {
            $role = Roles::EXECUTIVE_DIRECTOR;

            $user->assignRole($role);

            if ($request->input("permissions") != null) {
                $permissionNames = collect($request->input("permissions"))->pluck("name");
                $user->givePermissionTo($permissionNames);
            }
        }
        return ResponseResource::make($user);
    }

    public function updateExecutiveDirectorById($request, $id)
    {
        if (!Permission::hasPermissionTo(Permissions::EXECUTIVE_DIRECTOR_EDIT))
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

    public function deleteExecutiveDirectorById($id)
    {
        if (!Permission::hasPermissionTo(Permissions::EXECUTIVE_DIRECTOR_DELETE))
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
