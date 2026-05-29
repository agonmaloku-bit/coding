<?php

namespace App\Mediators\Contracts;

interface ContractTypeMediatorInterface
{
    public function getAll();

    public function findbyId($id);

    public function createContractType($request);

    public function editContractTypeById($request, $id);

    public function deleteContractTypeById($id);
}
