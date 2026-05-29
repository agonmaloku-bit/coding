<?php

namespace App\Mediators\Contracts;

interface LegalOfficeMediatorInterface
{
    public function getAllLegalOffices();

    public function findbyId($id);

    public function storeLegalOffice($request);

    public function updateLegalOfficeById($request, $id);

    public function deleteLegalOfficeById($id);
}
