<?php

namespace App\Mediators\Contracts;

interface ExecutiveDirectorMediatorInterface
{
    public function getAllExecutiveDirectors();

    public function findbyId($id);

    public function storeExecutiveDirector($request);

    public function updateExecutiveDirectorById($request, $id);

    public function deleteExecutiveDirectorById($id);
}
