<?php

namespace App\Mediators;

use App\Enums\Permissions;
use App\Http\Resources\ResponseResource;
use App\Logic\Permission;
use App\Models\Contract;
use App\Repositories\Contracts\ContractTypeRepositoryInterface;
use App\Mediators\Contracts\ContractTypeMediatorInterface;

class ContractTypeMediator implements ContractTypeMediatorInterface
{
    private $contractTypeRepository;

    public function __construct(ContractTypeRepositoryInterface $contractTypeRepository)
    {
        $this->contractTypeRepository = $contractTypeRepository;
    }

    public function getAll()
    {
        if (!Permission::hasPermissionTo([Permissions::CONTRACT_TYPE_SHOW, Permissions::CONTRACT_REQUEST, Permissions::CONTRACT_APPROVE]))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        return ResponseResource::make($this->contractTypeRepository->getAll());
    }

    public function findbyId($id)
    {
        if (!Permission::hasPermissionTo(Permissions::CONTRACT_TYPE_SHOW))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        return ResponseResource::make($this->contractTypeRepository->find($id));
    }

    public function createContractType($request)
    {
        if (!Permission::hasPermissionTo(Permissions::CONTRACT_TYPE_SHOW))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        return ResponseResource::make($this->contractTypeRepository->store($request->all()));
    }

    public function editContractTypeById($request, $id)
    {
        if (!Permission::hasPermissionTo(Permissions::CONTRACT_TYPE_EDIT))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        $result = $this->contractTypeRepository->update($id, $request->all());
        if ($result === 0) {
            return ResponseResource::make(['success' => false]);
        }
        return ResponseResource::make(['success' => true]);
    }

    public function deleteContractTypeById($id)
    {
        if (!Permission::hasPermissionTo(Permissions::CONTRACT_TYPE_DELETE))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        $result = $this->contractTypeRepository->destroy($id);
        if ($result === 0) {
            return ResponseResource::make(['success' => false]);
        }
        return ResponseResource::make(['success' => true]);
    }
}
