<?php

namespace App\Repositories\Contracts;

interface ContractTemplateRepositoryInterface
{
    public function getAll();
    public function getByContractType($contractTypeId);
}
