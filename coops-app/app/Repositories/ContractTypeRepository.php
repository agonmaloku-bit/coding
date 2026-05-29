<?php

namespace App\Repositories;

use App\Models\ContractType;
use App\Repositories\Contracts\ContractTypeRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

class ContractTypeRepository extends BaseRepository implements ContractTypeRepositoryInterface
{
    public function __construct(ContractType $model)
    {
        parent::__construct($model);
    }

    public function getAll()
    {
        $query = $this->model->with('company');

        if (request()->has('company_id') && request()->input('company_id') != null) {
            $query->where('company_id', request()->input('company_id'));
        }

        if (request()->has('page'))
        {
            return $query
                ->orderByDesc('id')
                ->paginate(10);
        }

        return $query->orderByDesc('id')->get();
    }
}
