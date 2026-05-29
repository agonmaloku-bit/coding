<?php

namespace App\Mediators;

use App\Enums\Permissions;
use App\Http\Resources\ResponseResource;
use App\Logic\Permission;
use App\Repositories\Contracts\CompanyRepositoryInterface;
use App\Mediators\Contracts\CompanyMediatorInterface;

class CompanyMediator1 implements CompanyMediatorInterface
{
    private $companyRepository;

    public function __construct(CompanyRepositoryInterface $companyRepository)
    {
        $this->companyRepository = $companyRepository;
    }

    public function getAll()
    {
        if (!Permission::hasPermissionTo([Permissions::COMPANY_SHOW, Permissions::CONTRACT_REQUEST]))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        return ResponseResource::make($this->companyRepository->getAll());
    }

    public function findbyId($id)
    {
        if (!Permission::hasPermissionTo(Permissions::COMPANY_SHOW))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        return ResponseResource::make($this->companyRepository->find($id));
    }

    public function storeCompany($request)
    {
        if (!Permission::hasPermissionTo(Permissions::COMPANY_ADD))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        return ResponseResource::make($this->companyRepository->store($request->all()));
    }

    public function updateCompanybyId($request, $id)
    {
        if (!Permission::hasPermissionTo(Permissions::COMPANY_EDIT))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        $result = $this->companyRepository->update($id, $request->all());
        if ($result === 0) {
            return ResponseResource::make(['success' => false]);
        }
        return ResponseResource::make(['success' => true]);
    }

    public function deleteCompanybyId($id)
    {
        if (!Permission::hasPermissionTo(Permissions::COMPANY_DELETE))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        $result = $this->companyRepository->destroy($id);
        if ($result === 0) {
            return ResponseResource::make(['success' => false]);
        }
        return ResponseResource::make(['success' => true]);
    }
}
