<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Role\RoleStoreRequest;
use App\Http\Requests\Role\RoleUpdateRequest;
use App\Mediators\Contracts\RoleMediatorInterface;

class RoleController extends Controller
{
    private $roleMediator;

    public function __construct(RoleMediatorInterface $roleMediator)
    {
        $this->roleMediator = $roleMediator;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return $this->roleMediator->getAll();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(RoleStoreRequest $request)
    {
        return $this->roleMediator->storeRole($request);
    }

    /**
     * Display the specified resource.
     *
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function show($name)
    {
        return $this->roleMediator->findById($name);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function update(RoleUpdateRequest $request, $id)
    {
        return $this->roleMediator->updateRolebyId($request, $id);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        return $this->roleMediator->deleteRolebyId($id);
    }

    public function getAllRolesForDepartments($ids)
    {
        return $this->roleMediator->getAllRolesByDepartmentIds($ids);
    }


    public function getRoleByRoleNameInDepartments($depId, $roleName)
    {
        return $this->roleMediator->getRoleByRoleNameInDepartments($depId, $roleName);
    }
}
