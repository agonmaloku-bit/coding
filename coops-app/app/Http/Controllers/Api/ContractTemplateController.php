<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ContractTemplate\ContractTemplateStoreRequest;
use App\Http\Requests\ContractTemplate\ContractTemplateUpdateRequest;
use App\Mediators\Contracts\ContractTemplateMediatorInterface;
use Illuminate\Http\Request;

class ContractTemplateController extends Controller
{
    private $contractTemplateService;

    public function __construct(ContractTemplateMediatorInterface $contractTemplateService)
    {
        $this->contractTemplateService = $contractTemplateService;
    }

    public function index()
    {
        return $this->contractTemplateService->getAll();
    }

    public function store(ContractTemplateStoreRequest $request)
    {
        return $this->contractTemplateService->createContractTemplate($request);
    }

    public function show($id)
    {
        return $this->contractTemplateService->findById($id);
    }

    public function update(ContractTemplateUpdateRequest $request, $id)
    {
        return $this->contractTemplateService->editContractTemplateById($request, $id);
    }

    public function destroy($id)
    {
        return $this->contractTemplateService->deleteContractTemplateById($id);
    }

    public function getByContractType($contractTypeId)
    {
        return $this->contractTemplateService->getByContractType($contractTypeId);
    }

    public function fillTemplate(Request $request, $id)
    {
        return $this->contractTemplateService->fillTemplate($id, $request);
    }

    public function extractContent(Request $request)
    {
        return $this->contractTemplateService->extractFileContent($request);
    }

    public function downloadTemp(Request $request, $token)
    {
        return $this->contractTemplateService->downloadTemp($token);
    }

    public function download($id)
    {
        $template = \App\Models\ContractTemplate::findOrFail($id);

        if ($template->file_path && \Storage::disk('public')->exists($template->file_path)) {
            return \Storage::disk('public')->download($template->file_path);
        }

        // If only content, return as .txt download
        $filename = str_replace(' ', '_', $template->name) . '.txt';
        return response($template->content)
            ->header('Content-Type', 'text/plain')
            ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
    }
}
