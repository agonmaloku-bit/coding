<?php

namespace App\Mediators;

use App\Enums\Permissions;
use App\Enums\Roles;
use App\Http\Resources\ResponseResource;
use App\Logic\Permission;
use App\Mediators\Contracts\LegalOfficeMediatorInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Traits\ResponseJson;

class LegalOfficeMediator implements LegalOfficeMediatorInterface
{
    use ResponseJson;

    private $userRepository;

    public function __construct(UserRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function getAllLegalOffices()
    {
        if (!Permission::hasPermissionTo(Permissions::LEGAL_OFFICE_SHOW))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

//        return $this->checkIfNullAndReturnResponse($this->userRepository->getAllUsersByRoles(Roles::LEGAL_OFFICE));

        $role = Roles::LEGAL_OFFICE;

        return ResponseResource::make($this->userRepository->getAllUsersByRoles($role));
    }

    public function findbyId($id)
    {
        if (!Permission::hasPermissionTo(Permissions::LEGAL_OFFICE_SHOW))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }
//        return $this->checkIfNullAndReturnResponse($this->userRepository->findUserByIdAndRole($id, Roles::LEGAL_OFFICE));

        return ResponseResource::make($this->userRepository->findById($id));
    }

    public function storeLegalOffice($request)
    {
        if (!Permission::hasPermissionTo(Permissions::LEGAL_OFFICE_ADD))
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
//        $model->assignRole(Roles::LEGAL_OFFICE);
//
//        return $this->successResponse($model);

        $user = $this->userRepository->store($request->all());
        if ($user != null) {
            $role = Roles::LEGAL_OFFICE;

            $user->assignRole($role);

            if ($request->input("permissions") != null) {
                $permissionNames = collect($request->input("permissions"))->pluck("name");
                $user->givePermissionTo($permissionNames);
            }
        }
        return ResponseResource::make($user);
    }

    public function updateLegalOfficeById($request, $id)
    {
        if (!Permission::hasPermissionTo(Permissions::LEGAL_OFFICE_EDIT))
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

    public function deleteLegalOfficeById($id)
    {
        if (!Permission::hasPermissionTo(Permissions::LEGAL_OFFICE_DELETE))
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
