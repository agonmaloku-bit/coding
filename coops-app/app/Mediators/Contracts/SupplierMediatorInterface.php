<?php

namespace App\Mediators\Contracts;

interface SupplierMediatorInterface
{
    public function getAll();

    public function findbyId($id);

    public function storeSupplier($request);

    public function updateSupplierbyId($request, $id);

    public function deleteSupplierbyId($id);
}

