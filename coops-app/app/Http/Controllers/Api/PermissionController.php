<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Permission\PermissionStoreRequest;
use App\Http\Requests\Permission\PermissionUpdateRequest;
use App\Mediators\Contracts\PermissionMediatorInterface;

class PermissionController extends Controller
{
    private $permissionMediator;

    public function __construct(PermissionMediatorInterface $permissionMediator)
    {
        $this->permissionMediator = $permissionMediator;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return $this->permissionMediator->getAll();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(PermissionStoreRequest $request)
    {
        return $this->permissionMediator->storePermission($request);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return $this->permissionMediator->findById($id);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(PermissionUpdateRequest $request, $id)
    {
        return $this->permissionMediator->updatePermissionbyId($request, $id);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        return $this->permissionMediator->deletePermissionbyId($id);
    }

    public function getAllPermissionsForRoles($ids)
    {
        return $this->permissionMediator->getAllPermissionsByRoleIds($ids);
    }
}
