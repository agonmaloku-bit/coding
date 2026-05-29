<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LegalOffice\LegalOfficeStoreRequest;
use App\Http\Requests\LegalOffice\LegalOfficeUpdateRequest;
use App\Mediators\Contracts\LegalOfficeMediatorInterface;

class LegalOfficeController extends Controller
{
    private $repository;

    public function __construct(LegalOfficeMediatorInterface $repository)
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
        return $this->repository->getAllLegalOffices();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(LegalOfficeStoreRequest $request)
    {
        return $this->repository->storeLegalOffice($request);
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
    public function update(LegalOfficeUpdateRequest $request, $id)
    {
        return $this->repository->updateLegalOfficeById($request, $id);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        return $this->repository->deleteLegalOfficeById($id);
    }
}
