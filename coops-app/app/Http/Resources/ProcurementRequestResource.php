<?php

namespace App\Http\Resources;

use App\Enums\ProcurementStatus;
use Illuminate\Http\Resources\Json\JsonResource;

class ProcurementRequestResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'                => $this->id,
            'title'             => $this->title,
            'description'       => $this->description,
            'justification'     => $this->justification,
            'procurement_type'  => $this->procurement_type,
            'estimated_value'   => $this->estimated_value,
            'status'            => $this->status,
            'status_label'      => ProcurementStatus::label((int) $this->status),
            'step'              => $this->step,
            'needed_by'         => $this->needed_by?->toDateString(),
            'approved_at'       => $this->approved_at,
            'rejected_at'       => $this->rejected_at,
            'rejection_reason'  => $this->rejection_reason,
            'notes'             => $this->notes,
            'created_at'        => $this->created_at,
            'updated_at'        => $this->updated_at,
            'department'        => $this->department ? [
                'id'   => $this->department->id,
                'name' => $this->department->name,
            ] : null,
            'company'           => $this->company ? [
                'id'   => $this->company->id,
                'name' => $this->company->name,
            ] : null,
            'created_by'        => $this->createdBy ? [
                'id'         => $this->createdBy->id,
                'first_name' => $this->createdBy->first_name,
                'last_name'  => $this->createdBy->last_name,
            ] : null,
            'assigned_officer'  => $this->assignedOfficer ? [
                'id'         => $this->assignedOfficer->id,
                'first_name' => $this->assignedOfficer->first_name,
                'last_name'  => $this->assignedOfficer->last_name,
            ] : null,
            'approved_by'       => $this->approvedBy ? [
                'id'         => $this->approvedBy->id,
                'first_name' => $this->approvedBy->first_name,
                'last_name'  => $this->approvedBy->last_name,
            ] : null,
            'outcome_supplier'  => $this->outcomeSupplier ? [
                'id'   => $this->outcomeSupplier->id,
                'name' => $this->outcomeSupplier->name,
            ] : null,
            'outcome_contract_id' => $this->outcome_contract_id,
        ];
    }
}
