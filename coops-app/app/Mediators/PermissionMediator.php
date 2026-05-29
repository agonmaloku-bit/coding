<?php

namespace App\Mediators;

use App\Enums\Permissions;
use App\Http\Resources\ResponseResource;
use App\Logic\Permission;
use App\Repositories\Contracts\PermissionRepositoryInterface;
use App\Mediators\Contracts\PermissionMediatorInterface;

class PermissionMediator implements PermissionMediatorInterface
{
    private $permissionRepository;

    public function __construct(PermissionRepositoryInterface $permissionRepository)
    {
        $this->permissionRepository = $permissionRepository;
    }

    public function getAll()
    {
        if (!Permission::hasPermissionTo(Permissions::PERMISSIONS_SHOW))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        return ResponseResource::make($this->permissionRepository->getAll());
    }

    public function findById($id)
    {
        if (!Permission::hasPermissionTo(Permissions::PERMISSIONS_SHOW))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        return ResponseResource::make($this->permissionRepository->find($id));
    }

    public function getAllPermissionsByRoleIds($ids)
    {
        if (!Permission::hasPermissionTo(Permissions::PERMISSIONS_SHOW))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        return ResponseResource::make($this->permissionRepository->getAllPermissionsByRoleIds($ids));
    }

    public function storePermission($request)
    {
        if (!Permission::hasPermissionTo(Permissions::PERMISSIONS_EDIT))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        return ResponseResource::make($this->permissionRepository->store($request->all()));
    }

    public function updatePermissionById($request, $id)
    {
        if (!Permission::hasPermissionTo(Permissions::PERMISSIONS_EDIT))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        $result = $this->permissionRepository->update($id, $request->all());
        if ($result === 0) {
            return ResponseResource::make(['success' => false]);
        }
        return ResponseResource::make(['success' => true]);
    }

    public function deletePermissionById($id)
    {
        if (!Permission::hasPermissionTo(Permissions::PERMISSIONS_EDIT))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }
        
        $result = $this->permissionRepository->destroy($id);
        if ($result === 0) {
            return ResponseResource::make(['success' => false]);
        }
        return ResponseResource::make(['success' => true]);
    }
}
