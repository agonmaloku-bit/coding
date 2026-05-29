<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\WorkflowTemplate\WorkflowTemplateStoreRequest;
use App\Http\Requests\WorkflowTemplate\WorkflowTemplateUpdateRequest;
use App\Mediators\Contracts\WorkflowTemplateMediatorInterface;

class WorkflowTemplateController extends Controller
{
    private $workflowTemplateMediator;

    public function __construct(WorkflowTemplateMediatorInterface $workflowTemplateMediator)
    {
        $this->workflowTemplateMediator = $workflowTemplateMediator;
    }

    public function index()
    {
        return $this->workflowTemplateMediator->getAll();
    }

    public function store(WorkflowTemplateStoreRequest $request)
    {
        return $this->workflowTemplateMediator->create($request);
    }

    public function show($id)
    {
        return $this->workflowTemplateMediator->findById($id);
    }

    public function update(WorkflowTemplateUpdateRequest $request, $id)
    {
        return $this->workflowTemplateMediator->update($request, $id);
    }

    public function destroy($id)
    {
        return $this->workflowTemplateMediator->delete($id);
    }

    public function getByType($type)
    {
        return $this->workflowTemplateMediator->getByType($type);
    }
}
