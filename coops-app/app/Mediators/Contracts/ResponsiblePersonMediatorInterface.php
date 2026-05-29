<?php

namespace App\Mediators\Contracts;

interface ResponsiblePersonMediatorInterface
{
    public function getAllResponsiblePersons();

    public function getAllResponsiblePersonsByDepartmentId($id);

    public function findbyId($id);

    public function storeResponsiblePerson($request);

    public function updateResponsiblePersonById($request, $id);

    public function deleteResponsiblePersonById($id);
}
