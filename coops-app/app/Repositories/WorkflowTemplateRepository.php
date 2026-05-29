<?php

namespace App\Repositories;

use App\Models\WorkflowTemplate;
use App\Repositories\Contracts\WorkflowTemplateRepositoryInterface;

class WorkflowTemplateRepository extends BaseRepository implements WorkflowTemplateRepositoryInterface
{
    public function __construct(WorkflowTemplate $model)
    {
        parent::__construct($model);
    }

    public function getAll()
    {
        return $this->model
            ->withSteps()
            ->orderByDesc('id')
            ->paginate(15);
    }

    public function findById($id)
    {
        return $this->model
            ->withSteps()
            ->findOrFail($id);
    }

    public function getByType($type)
    {
        return $this->model
            ->withSteps()
            ->where('type', $type)
            ->where('is_active', true)
            ->orderByDesc('id')
            ->get();
    }

    public function getDefaultByType($type, $companyId = null)
    {
        $query = $this->model
            ->withSteps()
            ->where('type', $type)
            ->where('is_active', true);

        if ($companyId) {
            $template = (clone $query)->where('company_id', $companyId)->first();
            if ($template) {
                return $template;
            }
        }

        return $query->where('is_default', true)->first();
    }
}
