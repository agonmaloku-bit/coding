<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ExecutiveDirector\ExecutiveDirectorStoreRequest;
use App\Http\Requests\ExecutiveDirector\ExecutiveDirectorUpdateRequest;
use App\Mediators\Contracts\ExecutiveDirectorMediatorInterface;

class ExecutiveDirectorController extends Controller
{
    private $repository;

    public function __construct(ExecutiveDirectorMediatorInterface $repository)
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
        return $this->repository->getAllExecutiveDirectors();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(ExecutiveDirectorStoreRequest $request)
    {
        return $this->repository->storeExecutiveDirector($request);
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
    public function update(ExecutiveDirectorUpdateRequest $request, $id)
    {
        return $this->repository->updateExecutiveDirectorById($request, $id);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        return $this->repository->deleteExecutiveDirectorById($id);
    }
}
