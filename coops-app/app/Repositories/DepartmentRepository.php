<?php

namespace App\Repositories;

use App\Models\Department;
use App\Repositories\Contracts\DepartmentRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

class DepartmentRepository extends BaseRepository implements DepartmentRepositoryInterface
{
    public function __construct(Department $model)
    {
        parent::__construct($model);
    }

    public function getAll()
    {
        if (request()->has('page')) {
            return $this->model
                ->with('company', 'roles')
                ->orderByDesc('id')
                ->paginate(10);
        }

        return $this->model
            ->with('company', 'roles')
            ->orderByDesc('id')
            ->get();
    }

    public function findById($id)
    {
        return $this->model
            ->with('company', 'roles')
            ->whereId($id)
            ->first();
    }

    public function countAll()
    {
        return $this->model->count();
    }

    public function getByCompanyId($id)
    {
        return $this->model
            ->where('company_id', $id)
            ->orderByDesc('id')
            ->get();
    }
}
