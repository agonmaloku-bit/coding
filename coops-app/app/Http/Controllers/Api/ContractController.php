<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Contract\ContractRequestRequest;
use App\Http\Requests\Contract\ContractStoreRequest;
use App\Http\Requests\Contract\ContractUpdateRequest;
use App\Mediators\Contracts\ContractMediatorInterface;
use App\Models\Contract;
use Illuminate\Http\Request;

class ContractController extends Controller
{
    private $contractMediator;

    public function __construct(ContractMediatorInterface $contractMediator)
    {
        $this->contractMediator = $contractMediator;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return $this->contractMediator->getAll();
    }

    public function getArchiveContracts()
    {
        return $this->contractMediator->getArchiveContracts();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(ContractStoreRequest $request)
    {
        return $this->contractMediator->createContract($request);
    }

    public function request(ContractRequestRequest $request)
    {
        return $this->contractMediator->requestContract($request);
    }

    /**
     * Display the specified resource.
     *
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return $this->contractMediator->findById($id);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function update(ContractUpdateRequest $request, $id)
    {
        return $this->contractMediator->editContractById($request, $id);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        return $this->contractMediator->deleteContractById($id);
    }

    public function approveContract($id)
    {
        return $this->contractMediator->approveContract($id);
    }

    public function cancelContract($id)
    {
        return $this->contractMediator->cancelContract($id);
    }
    public function sendmail()
    {
        return $this->contractMediator->sendMail();
    }

    public function export()
    {
        return $this->contractMediator->exportToExcel();
    }
    
    public function getDashboardData()
    {
        return $this->contractMediator->getDashboardData();
    }

    public function getBySupplier($supplierId)
    {
        $contracts = Contract::where('supplier_id', $supplierId)
            ->whereNull('deleted_at')
            ->orderBy('id', 'desc')
            ->get(['id', 'name', 'serial_number', 'deadline_from', 'deadline_to', 'status']);

        return response()->json(['data' => $contracts]);
    }

    public function requestChanges(Request $request, $id)
    {
        return $this->contractMediator->requestChanges($id, $request);
    }

    public function reassignResponsible(Request $request, $id)
    {
        return $this->contractMediator->reassignResponsible($id, $request);
    }

    public function timeline($id)
    {
        return $this->contractMediator->getTimeline($id);
    }
}
