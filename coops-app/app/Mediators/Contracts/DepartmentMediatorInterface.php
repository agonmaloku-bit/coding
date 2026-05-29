<?php

namespace App\Mediators\Contracts;

interface DepartmentMediatorInterface
{
    public function getAll();

    public function findbyId($id);

    public function createDepartment($request);

    public function editDepartmentById($request, $id);

    public function deleteDepartmentById($id);

    public function countAllDepartments();
}
