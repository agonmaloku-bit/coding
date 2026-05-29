<?php

namespace App\Mediators\Contracts;

interface WorkflowTemplateMediatorInterface
{
    public function getAll();
    public function findById($id);
    public function create($request);
    public function update($request, $id);
    public function delete($id);
    public function getByType($type);
}
