<?php

namespace App\Mediators\Contracts;

interface PermissionMediatorInterface
{
    public function getAll();

    public function findById($id);

    public function getAllPermissionsByRoleIds($ids);

    public function storePermission($request);

    public function updatePermissionById($request, $id);

    public function deletePermissionById($id);
}
