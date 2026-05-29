<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProcurementOfficer\ProcurementOfficerStoreRequest;
use App\Http\Requests\ProcurementOfficer\ProcurementOfficerUpdateRequest;
use App\Mediators\Contracts\ProcurementOfficerMediatorInterface;

class ProcurementOfficerController extends Controller
{
    private $repository;

    public function __construct(ProcurementOfficerMediatorInterface $repository)
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
        return $this->repository->getAllProcurementOfficers();
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function getAllProcurementOfficersByDepartmentId($id)
    {
        return $this->repository->getAllProcurementOfficersByDepartmentId($id);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(ProcurementOfficerStoreRequest $request)
    {
        return $this->repository->storeProcurementOfficer($request);
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
    public function update(ProcurementOfficerUpdateRequest $request, $id)
    {
        return $this->repository->updateProcurementOfficerById($request, $id);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        return $this->repository->deleteProcurementOfficerById($id);
    }
}
