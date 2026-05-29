<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ContractType\ContractTypeStoreRequest;
use App\Http\Requests\ContractType\ContractTypeUpdateRequest;
use App\Mediators\Contracts\ContractTypeMediatorInterface;

class ContractTypeController extends Controller
{
    private $contractTypeService;

    public function __construct(ContractTypeMediatorInterface $contractTypeService)
    {
        $this->contractTypeService = $contractTypeService;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return $this->contractTypeService->getAll();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(ContractTypeStoreRequest $request)
    {
        return $this->contractTypeService->createContractType($request);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return $this->contractTypeService->findById($id);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(ContractTypeUpdateRequest $request, $id)
    {
        return $this->contractTypeService->editContractTypeById($request, $id);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        return $this->contractTypeService->deleteContractTypeById($id);
    }
}
