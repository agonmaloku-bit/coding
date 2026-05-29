<?php

namespace App\Mediators;

use App\Enums\Permissions;
use App\Http\Resources\ResponseResource;
use App\Logic\Permission;
use App\Repositories\Contracts\SupplierRepositoryInterface;
// use App\Mediators\Contracts\SupplierMediatorInterface;
use App\Mediators\Contracts\SupplierMediatorInterface;


class SupplierMediator implements SupplierMediatorInterface
{
    private $supplierRepository;

    public function __construct(SupplierRepositoryInterface $supplierRepository)
    {
        $this->supplierRepository = $supplierRepository;
    }

    public function getAll()
    {
        if (!Permission::hasPermissionTo([Permissions::SUPPLIER_SHOW]))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        return ResponseResource::make($this->supplierRepository->getAll());
    }

    public function findbyId($id)
    {
        if (!Permission::hasPermissionTo(Permissions::SUPPLIER_SHOW))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }
        return ResponseResource::make($this->supplierRepository->find($id));
    }

    public function storeSupplier($request)
    {
        if (!Permission::hasPermissionTo(Permissions::SUPPLIER_ADD))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        return ResponseResource::make($this->supplierRepository->store($request->all()));
    }

    public function updateSupplierbyId($request, $id)
    {
        if (!Permission::hasPermissionTo(Permissions::SUPPLIER_EDIT))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        $result = $this->supplierRepository->update($id, $request->all());
        if ($result === 0) {
            return ResponseResource::make(['success' => false]);
        }
        return ResponseResource::make(['success' => true]);
    }

    public function deleteSupplierbyId($id)
    {
        if (!Permission::hasPermissionTo(Permissions::SUPPLIER_DELETE))
        {
            return response([
                'data' => new ResponseResource(['forbidden' => true]),
                'message' => 'You do not have the required authorization.'],
                403
            );
        }

        $result = $this->supplierRepository->destroy($id);
        if ($result === 0) {
            return ResponseResource::make(['success' => false]);
        }
        return ResponseResource::make(['success' => true]);
    }
}
