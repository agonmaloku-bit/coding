<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DirectorDepartment\DirectorDepartmentStoreRequest;
use App\Http\Requests\DirectorDepartment\DirectorDepartmentUpdateRequest;
use App\Http\Requests\DirectorDepartment\ExecutiveDirectorStoreRequest;
use App\Http\Requests\DirectorDepartment\ExecutiveDirectorUpdateRequest;
use App\Mediators\Contracts\DirectorDepartmentMediatorInterface;

class DirectorDepartmentController extends Controller
{
    private $repository;

    public function __construct(DirectorDepartmentMediatorInterface $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return $this->repository->getAllDirectorDepartments();
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function getAllDirectorDepartmentsByDepartmentId($id)
    {
        return $this->repository->getAllDirectorDepartmentsByDepartmentId($id);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(DirectorDepartmentStoreRequest $request)
    {
        return $this->repository->storeDirectorDepartment($request);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return $this->repository->findById($id);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(DirectorDepartmentUpdateRequest $request, $id)
    {
        return $this->repository->updateDirectorDepartmentById($request, $id);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        return $this->repository->deleteDirectorDepartmentById($id);
    }
}
