<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;

interface BillRepositoryInterface
{
    public function getAll($request);

    public function findById($id);

    public function getAllBills($userId);

    public function getAllActiveBills($userId);

}