<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Department\DepartmentStoreRequest;
use App\Http\Requests\Department\DepartmentUpdateRequest;
use App\Mediators\Contracts\DepartmentMediatorInterface;

class DepartmentController extends Controller
{
    private $departmentMediator;

    public function __construct(DepartmentMediatorInterface $departmentMediator)
    {
        $this->departmentMediator = $departmentMediator;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return $this->departmentMediator->getAll();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(DepartmentStoreRequest $request)
    {
        return $this->departmentMediator->createDepartment($request);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return $this->departmentMediator->findById($id);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(DepartmentUpdateRequest $request, $id)
    {
        return $this->departmentMediator->editDepartmentById($request, $id);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        return $this->departmentMediator->deleteDepartmentById($id);
    }

    public function countAllDepartments()
    {
        return $this->departmentMediator->countAllDepartments();
    }

    public function getAllDepartmentsByCompanyId($id)
    {
        return $this->departmentMediator->getAllDepartmentsByCompanyId($id);
    }
}
