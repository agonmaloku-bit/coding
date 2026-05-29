<?php

namespace App\Mediators;

use App\Enums\Permissions;
use App\Http\Resources\ResponseResource;
use App\Logic\Permission;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Mediators\Contracts\UserMediatorInterface;

class UserMediator implements UserMediatorInterface
{
    private $userRepository;

    public function __construct(UserRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function getAll()
    {
        if (!Permission::hasPermissionTo(Permissions::USERS_SHOW))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        return ResponseResource::make($this->userRepository->getAll());
    }

    public function findById($id)
    {
        if (!Permission::hasPermissionTo(Permissions::USERS_SHOW))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        return ResponseResource::make($this->userRepository->findById($id));
    }

    public function storeUser($request)
    {
        if (!Permission::hasPermissionTo(Permissions::USERS_ADD))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        $user = $this->userRepository->store($request->all());
        if ($user != null) {
//            $roleNames = collect($request->input("roles"))->pluck("name");
            $roleNames = $request->input('roles')['name'];
            $user->assignRole($roleNames);

            if ($request->input("permissions") != null) {
                $permissionNames = collect($request->input("permissions"))->pluck("name");
                $user->givePermissionTo($permissionNames);
            }
        }
        return ResponseResource::make($user);
    }

    public function updateUserById($request, $id)
    {
        // var_dump($request->all());
        if (!Permission::hasPermissionTo(Permissions::USERS_EDIT))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        $data = $request->except(['password_confirmation']);

        // Only update password if a non-empty value was actually provided
        if (empty($data['password'])) {
            unset($data['password']);
        }

        $result = $this->userRepository->update($id, $data);

        if ($result === 0) {
            return ResponseResource::make(['success' => false]);
        }

//        $roleNames = collect($request->input("roles"))->pluck("name");
        $user = $this->userRepository->findById($id);
        if ($request->has('roles'))
        {
            if (2 > count($request->input('roles')))
            {
                $roleNames = collect($request->input("roles"))->pluck("name");
            }
            else
            {
                $roleNames = $request->input('roles')['name'];
            }
//            $roleNames = $request->input('roles');
//            $roleNames = collect($request->input("roles"))->pluck("name");
            $user->syncRoles($roleNames);
        }

        if ($request->has("permissions")) {
            $permissionNames = collect($request->input("permissions"))->pluck("name");
            $user->syncPermissions($permissionNames);
        }

        return ResponseResource::make(['success' => true]);
    }

    public function deleteUserById($id)
    {
        if (!Permission::hasPermissionTo(Permissions::USERS_DELETE))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        $result = $this->userRepository->destroy($id);
        if ($result === 0) {
            return ResponseResource::make(['success' => false]);
        }
        return ResponseResource::make(['success' => true]);
    }
}
