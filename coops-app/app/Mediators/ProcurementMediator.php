<?php

namespace App\Mediators;

use App\Enums\Permissions;
use App\Enums\ProcurementStatus;
use App\Http\Resources\ProcurementRequestResource;
use App\Http\Resources\ResponseResource;
use App\Logic\Permission;
use App\Mediators\Contracts\ProcurementMediatorInterface;
use App\Repositories\Contracts\ProcurementRequestRepositoryInterface;
use Illuminate\Support\Carbon;

class ProcurementMediator implements ProcurementMediatorInterface
{
    private $repo;

    public function __construct(ProcurementRequestRepositoryInterface $repo)
    {
        $this->repo = $repo;
    }

    public function getAll($request)
    {
        if (!Permission::hasPermissionTo(Permissions::PROCUREMENT_SHOW)) {
            return $this->forbidden();
        }

        return ProcurementRequestResource::collection($this->repo->getAll($request));
    }

    public function findById($id)
    {
        if (!Permission::hasPermissionTo(Permissions::PROCUREMENT_SHOW)) {
            return $this->forbidden();
        }

        return new ProcurementRequestResource($this->repo->findById($id));
    }

    public function create($request)
    {
        if (!Permission::hasPermissionTo(Permissions::PROCUREMENT_REQUEST)) {
            return $this->forbidden();
        }

        $user = auth()->user();

        $data = array_merge($request->validated(), [
            'created_by'  => $user->id,
            'company_id'  => $user->department?->company_id,
            'status'      => ProcurementStatus::DRAFT,
            'step'        => 1,
        ]);

        $model = $this->repo->store($data);

        return new ProcurementRequestResource($this->repo->findById($model->id));
    }

    public function update($request, $id)
    {
        if (!Permission::hasPermissionTo(Permissions::PROCUREMENT_EDIT)) {
            return $this->forbidden();
        }

        $model = $this->repo->findById($id);

        if (in_array($model->status, [ProcurementStatus::COMPLETED, ProcurementStatus::REJECTED, ProcurementStatus::CANCELLED])) {
            return response(['message' => 'Cannot edit a closed procurement request.'], 422);
        }

        $this->repo->update($id, $request->validated());

        return new ProcurementRequestResource($this->repo->findById($id));
    }

    public function delete($id)
    {
        if (!Permission::hasPermissionTo(Permissions::PROCUREMENT_DELETE)) {
            return $this->forbidden();
        }

        $this->repo->delete($id);

        return response(['success' => true]);
    }

    /**
     * Advance the procurement request through status states.
     * statusMap: current → next allowed status.
     */
    public function advance($id, $request)
    {
        if (!Permission::hasPermissionTo(Permissions::PROCUREMENT_APPROVE)) {
            return $this->forbidden();
        }

        $model = $this->repo->findById($id);

        $next = $this->nextStatus($model->status);

        if ($next === null) {
            return response(['message' => 'Request is already in a final state.'], 422);
        }

        $update = [
            'status' => $next,
            'step'   => ($model->step ?? 0) + 1,
        ];

        if ($next === ProcurementStatus::APPROVED) {
            $update['approved_by'] = auth()->id();
            $update['approved_at'] = Carbon::now();
        }

        if ($next === ProcurementStatus::IN_PROCESSING && $request->filled('assigned_officer')) {
            $update['assigned_officer'] = $request->input('assigned_officer');
        }

        if ($next === ProcurementStatus::COMPLETED) {
            if ($request->filled('outcome_supplier_id')) {
                $update['outcome_supplier_id'] = $request->input('outcome_supplier_id');
            }
            if ($request->filled('outcome_contract_id')) {
                $update['outcome_contract_id'] = $request->input('outcome_contract_id');
            }
        }

        if ($request->filled('notes')) {
            $update['notes'] = $request->input('notes');
        }

        $this->repo->update($id, $update);

        return new ProcurementRequestResource($this->repo->findById($id));
    }

    public function reject($id, $request)
    {
        if (!Permission::hasPermissionTo(Permissions::PROCUREMENT_APPROVE)) {
            return $this->forbidden();
        }

        $model = $this->repo->findById($id);

        if (in_array($model->status, [ProcurementStatus::COMPLETED, ProcurementStatus::REJECTED, ProcurementStatus::CANCELLED])) {
            return response(['message' => 'Request is already closed.'], 422);
        }

        $this->repo->update($id, [
            'status'           => ProcurementStatus::REJECTED,
            'rejection_reason' => $request->input('reason'),
            'rejected_at'      => Carbon::now(),
        ]);

        return new ProcurementRequestResource($this->repo->findById($id));
    }

    public function cancel($id)
    {
        $model = $this->repo->findById($id);

        if ($model->created_by !== auth()->id() && !Permission::hasPermissionTo(Permissions::PROCUREMENT_APPROVE)) {
            return $this->forbidden();
        }

        $this->repo->update($id, ['status' => ProcurementStatus::CANCELLED]);

        return new ProcurementRequestResource($this->repo->findById($id));
    }

    private function nextStatus(int $current): ?int
    {
        $flow = [
            ProcurementStatus::DRAFT            => ProcurementStatus::SUBMITTED,
            ProcurementStatus::SUBMITTED        => ProcurementStatus::UNDER_REVIEW,
            ProcurementStatus::UNDER_REVIEW     => ProcurementStatus::APPROVED,
            ProcurementStatus::APPROVED         => ProcurementStatus::IN_PROCESSING,
            ProcurementStatus::IN_PROCESSING    => ProcurementStatus::OFFER_EVALUATION,
            ProcurementStatus::OFFER_EVALUATION => ProcurementStatus::AWARDED,
            ProcurementStatus::AWARDED          => ProcurementStatus::COMPLETED,
        ];

        return $flow[$current] ?? null;
    }

    private function forbidden()
    {
        return response([
            'data'    => new ResponseResource(['forbidden' => true]),
            'message' => 'You do not have the required authorization.',
        ], 403);
    }
}
