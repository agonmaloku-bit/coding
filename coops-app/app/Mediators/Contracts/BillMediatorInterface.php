<?php

namespace App\Mediators\Contracts;

interface BillMediatorInterface
{
    public function getAll($request);
    public function findbyId($id);
    public function createBill($request);
    public function editBillById($request, $id);
    public function deleteBillById($id);
    public function RemoveFile($id);
    // public function getDashboardData();
// public function storeBill($request);

}