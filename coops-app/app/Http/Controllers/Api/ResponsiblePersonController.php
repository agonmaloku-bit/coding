<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ResponsiblePerson\ResponsiblePersonStoreRequest;
use App\Http\Requests\ResponsiblePerson\ResponsiblePersonUpdateRequest;
use App\Mediators\Contracts\ResponsiblePersonMediatorInterface;

class ResponsiblePersonController extends Controller
{
    private $responsiblePersonMediator;

    public function __construct(ResponsiblePersonMediatorInterface $responsiblePersonMediator)
    {
        $this->responsiblePersonMediator = $responsiblePersonMediator;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return $this->responsiblePersonMediator->getAllResponsiblePersons();
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function getAllResponsiblePersonsByDepartmentId($id)
    {
        return $this->responsiblePersonMediator->getAllResponsiblePersonsByDepartmentId($id);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(ResponsiblePersonStoreRequest $request)
    {
        return $this->responsiblePersonMediator->storeResponsiblePerson($request);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return $this->responsiblePersonMediator->findById($id);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(ResponsiblePersonUpdateRequest $request, $id)
    {
        return $this->responsiblePersonMediator->updateResponsiblePersonById($request, $id);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        return $this->responsiblePersonMediator->deleteResponsiblePersonById($id);
    }
}
