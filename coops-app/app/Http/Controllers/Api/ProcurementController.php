<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Procurement\ProcurementStoreRequest;
use App\Http\Requests\Procurement\ProcurementUpdateRequest;
use App\Mediators\Contracts\ProcurementMediatorInterface;
use Illuminate\Http\Request;

class ProcurementController extends Controller
{
    private $mediator;

    public function __construct(ProcurementMediatorInterface $mediator)
    {
        $this->mediator = $mediator;
    }

    public function index(Request $request)
    {
        return $this->mediator->getAll($request);
    }

    public function store(ProcurementStoreRequest $request)
    {
        return $this->mediator->create($request);
    }

    public function show($id)
    {
        return $this->mediator->findById($id);
    }

    public function update(ProcurementUpdateRequest $request, $id)
    {
        return $this->mediator->update($request, $id);
    }

    public function destroy($id)
    {
        return $this->mediator->delete($id);
    }

    public function advance(Request $request, $id)
    {
        return $this->mediator->advance($id, $request);
    }

    public function reject(Request $request, $id)
    {
        return $this->mediator->reject($id, $request);
    }

    public function cancel($id)
    {
        return $this->mediator->cancel($id);
    }
}
