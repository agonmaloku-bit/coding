<?php

namespace App\Mediators\Contracts;

interface ContractTemplateMediatorInterface
{
    public function getAll();
    public function findById($id);
    public function createContractTemplate($request);
    public function editContractTemplateById($request, $id);
    public function deleteContractTemplateById($id);
    public function getByContractType($contractTypeId);
    public function fillTemplate($id, $request);
    public function extractFileContent($request);
    public function downloadTemp($token);
}
