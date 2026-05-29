<?php

namespace App\Mediators\Contracts;

interface ContractMediatorInterface
{
    public function getAll();

    public function findbyId($id);

    public function createContract($request);

    public function editContractById($request, $id);

    public function deleteContractById($id);
    
    public function getDashboardData();

    public function requestChanges($id, $request);

    public function reassignResponsible($id, $request);

    public function getTimeline($id);
}
