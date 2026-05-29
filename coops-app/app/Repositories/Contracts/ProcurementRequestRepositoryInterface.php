<?php

namespace App\Repositories\Contracts;

interface ProcurementRequestRepositoryInterface
{
    public function getAll($request);
    public function findById($id);
    public function store(array $data);
    public function update($id, array $data);
    public function delete($id);
}
