<?php

namespace App\Mediators;

use App\Enums\Permissions;
use App\Http\Resources\ResponseResource;
use App\Logic\Permission;
use App\Repositories\Contracts\DepartmentRepositoryInterface;
use App\Mediators\Contracts\DepartmentMediatorInterface;

class DepartmentMediator implements DepartmentMediatorInterface
{
    private $departmentRepository;

    public function __construct(DepartmentRepositoryInterface $departmentRepository)
    {
        $this->departmentRepository = $departmentRepository;
    }

    public function getAll()
    {
        if (!Permission::hasPermissionTo([Permissions::DEPARTMENTS_SHOW, Permissions::CONTRACT_REQUEST]))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        return ResponseResource::make($this->departmentRepository->getAll());
    }

    public function findbyId($id)
    {
        if (!Permission::hasPermissionTo(Permissions::DEPARTMENTS_SHOW))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        return ResponseResource::make($this->departmentRepository->findById($id));
    }

    public function createDepartment($request)
    {
        if (!Permission::hasPermissionTo(Permissions::DEPARTMENTS_EDIT))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        $dep = $this->departmentRepository->store($request->all());
        if ($dep != null) {
            $dep->company()->associate($request->input('company_id'));
        }

        return ResponseResource::make($dep);
    }

    public function editDepartmentById($request, $id)
    {
        if (!Permission::hasPermissionTo(Permissions::DEPARTMENTS_EDIT))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        $result = $this->departmentRepository->update($id, $request->all());

        if ($result === 0) {
            return ResponseResource::make(['success' => false]);
        }
        $department = $this->departmentRepository->find($id);
        $department->company()->associate($request->input('company_id'));

        return ResponseResource::make(['success' => true]);
    }

    public function deleteDepartmentById($id)
    {
        if (!Permission::hasPermissionTo(Permissions::DEPARTMENTS_DELETE))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        $result = $this->departmentRepository->destroy($id);
        if ($result === 0) {
            return ResponseResource::make(['success' => false]);
        }
        return ResponseResource::make(['success' => true]);
    }

    public function countAllDepartments()
    {
        if (!Permission::hasPermissionTo(Permissions::DEPARTMENTS_SHOW))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        return ResponseResource::make(["count" => $this->departmentRepository->countAll()]);
    }

    public function getAllDepartmentsByCompanyId($id)
    {
        return ResponseResource::make($this->departmentRepository->getByCompanyId($id));
    }
}
