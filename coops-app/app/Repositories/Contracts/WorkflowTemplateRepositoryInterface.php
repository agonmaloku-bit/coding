<?php

namespace App\Repositories\Contracts;

interface WorkflowTemplateRepositoryInterface
{
    public function getAll();
    public function findById($id);
    public function getByType($type);
    public function getDefaultByType($type, $companyId = null);
}
