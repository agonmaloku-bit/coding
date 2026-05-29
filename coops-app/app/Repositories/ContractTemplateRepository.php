<?php

namespace App\Repositories;

use App\Models\ContractTemplate;
use App\Repositories\Contracts\ContractTemplateRepositoryInterface;

class ContractTemplateRepository extends BaseRepository implements ContractTemplateRepositoryInterface
{
    public function __construct(ContractTemplate $model)
    {
        parent::__construct($model);
    }

    public function getAll()
    {
        $query = $this->model->with('contractType');

        if (request()->has('contract_type_id') && request()->input('contract_type_id') != null) {
            $query->where('contract_type_id', request()->input('contract_type_id'));
        }

        if (request()->has('page')) {
            return $query->orderByDesc('id')->paginate(10);
        }

        return $query->orderByDesc('id')->get();
    }

    public function find($id)
    {
        return $this->model->with('contractType')->find($id);
    }

    public function getByContractType($contractTypeId)
    {
        return $this->model
            ->where('contract_type_id', $contractTypeId)
            ->orderByDesc('id')
            ->get();
    }
}
