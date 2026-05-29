<?php

namespace App\Repositories;

use App\Models\Supplier;
use App\Repositories\Contracts\SupplierRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

class SupplierRepository extends BaseRepository implements SupplierRepositoryInterface
{
    public function __construct(Supplier $model)
    {
        parent::__construct($model);
    }

    public function getAll()
    {
        if (request()->has('page'))
        {
            return $this->model
                ->orderByDesc('id')
                ->paginate(10);
        }

        return $this->model
            ->orderByDesc('id')
            ->get();
    }

    public function findById($id)
    {
        return $this->model
            ->whereId($id)
            ->first();
    }
}
