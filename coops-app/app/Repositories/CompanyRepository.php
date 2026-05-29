<?php

namespace App\Repositories;

use App\Models\Company;
use App\Repositories\Contracts\CompanyRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

class CompanyRepository extends BaseRepository implements CompanyRepositoryInterface
{
    public function __construct(Company $model)
    {
        parent::__construct($model);
    }

    public function getAll()
    {
        if (request()->has('page'))
        {
            return $this->model
                ->with('departments')
                ->orderByDesc('id')
                ->paginate(10);
        }

        return $this->model
            ->with('departments')
            ->orderByDesc('id')
            ->get();
    }

    public function findById($id)
    {
        return $this->model
            ->with('departments')
            ->whereId($id)
            ->first();
    }
}
