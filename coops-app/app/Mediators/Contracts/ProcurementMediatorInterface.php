<?php

namespace App\Mediators\Contracts;

interface ProcurementMediatorInterface
{
    public function getAll($request);
    public function findById($id);
    public function create($request);
    public function update($request, $id);
    public function delete($id);
    public function advance($id, $request);
    public function reject($id, $request);
    public function cancel($id);
}
