<?php

namespace App\Mediators\Contracts;

interface DirectorDepartmentMediatorInterface
{
    public function getAllDirectorDepartments();

    public function getAllDirectorDepartmentsByDepartmentId($id);

    public function findbyId($id);

    public function storeDirectorDepartment($request);

    public function updateDirectorDepartmentById($request, $id);

    public function deleteDirectorDepartmentById($id);
}
