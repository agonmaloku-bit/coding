<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;

interface UserRepositoryInterface
{
    public function getAll();

    public function findById($id);

    public function getAllUsersByRoles($roles);

    // public function getAllUsersOfDepartartment($departament);

    public function getAllUsersByDepartmentIdAndRole($id, $role);

    public function findUserByIdAndRole($id, $roles);
}