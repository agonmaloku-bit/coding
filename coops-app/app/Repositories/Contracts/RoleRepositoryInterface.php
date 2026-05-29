<?php

namespace App\Repositories\Contracts;

interface RoleRepositoryInterface
{
    public function getAll();

    public function findById($id);

    public function getAllRolesByDepartmentIds($ids);

    public function getAllRolesForType($type);
}
