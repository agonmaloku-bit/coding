<?php

namespace App\Mediators\Contracts;

interface ProcurementOfficerMediatorInterface
{
    public function getAllProcurementOfficers();

    public function getAllProcurementOfficersByDepartmentId($id);

    public function findbyId($id);

    public function storeProcurementOfficer($request);

    public function updateProcurementOfficerById($request, $id);

    public function deleteProcurementOfficerById($id);
}
