<?php

namespace App\Mediators\Contracts;

interface RoleMediatorInterface
{
    public function getAll();

    public function findById($id);

    public function getAllRolesByDepartmentIds($ids);

    public function getRoleByRoleNameInDepartments($depId, $roleName);

    public function storeRole($request);

    public function updateRoleById($request, $id);

    public function deleteRoleById($id);
}
