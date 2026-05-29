<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Bill\BillRequestRequest;
use App\Http\Requests\Bill\BillStoreRequest;
use App\Http\Requests\Bill\BillUpdateRequest;
use App\Mediators\Contracts\BillMediatorInterface;
use Illuminate\Http\Request;

class BillController extends Controller
{
    private $billMediator;

    public function __construct(BillMediatorInterface $billMediator)
    {
        $this->billMediator = $billMediator;
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        // return response()->json("Skill Index");
        return $this->billMediator->getAll($request);
    }
    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */

    public function store(BillStoreRequest $request)
    {
        return $this->billMediator->createBill($request);
    }
    public function request(BillRequestRequest $request)
    {
        return $this->billMediator->requestBill($request);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */

    public function show($id)
    {
        return $this->billMediator->findById($id);
    }
    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */

    public function update(Request $request, $id)
    {
        return $this->billMediator->editBillById($request, $id);
    }

    public function edit($id)
    {
        $data = [
            'scope' => 'edit',
            'id' => $id,
        ];
        return view('student.form')->with($data);
    }
    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        return $this->billMediator->deleteBillById($id);
    }

    public function approveBill($id)
    {
        return $this->billMediator->approveBill($id);
    }
    public function cancelBill($id)
    {
        return $this->billMediator->cancelBill($id);
    }
    public function export()
    {
        return $this->billMediator->exportToExcel();
    }

    public function destroyBillFile($id)
    {
        return $this->billMediator->RemoveFile($id);
    }
    public function getExistsBills($id, $supid)
    {
        return $this->billMediator->getExistsBill($id, $supid);
    }

    public function dashboard()
    {
        return $this->billMediator->dashboard();
    }

    public function timeline($id)
    {
        return $this->billMediator->getTimeline($id);
    }
}