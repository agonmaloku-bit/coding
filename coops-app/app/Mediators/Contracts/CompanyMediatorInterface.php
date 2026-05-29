<?php

namespace App\Mediators\Contracts;

interface CompanyMediatorInterface
{
    public function getAll();

    public function findbyId($id);

    public function storeCompany($request);

    public function updateCompanybyId($request, $id);

    public function deleteCompanybyId($id);
}
