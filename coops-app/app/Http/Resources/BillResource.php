<?php

namespace App\Http\Resources;

use App\Enums\Roles;
use Illuminate\Http\Resources\Json\JsonResource;

class BillResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        $currentUser = $request->user();
        $canApprove = false;
        $canPrint = false;
        $workflowStepLabel = null;

        if ($currentUser) {
            // --- can_print ---
            // Procurement Officers and Directors of "Prokurimi" dept can print when CEO has approved
            if ($this->status == 3) {
                $isProcurementOfficer = $currentUser->hasRole(Roles::PROCUREMENT_OFFICER);
                $isProkDirector = $currentUser->hasRole(Roles::DIRECTOR_DEPARTMENT)
                    && optional($currentUser->department)->name === 'Prokurimi';
                $canPrint = $isProcurementOfficer || $isProkDirector
                    || $currentUser->hasRole(Roles::SUPER_ADMIN);
            }

            // --- can_approve ---
            if ($this->workflow_template_id && $this->workflowTemplate) {
                $step = $this->workflowTemplate->getStepByOrder($this->step);
                if ($step && $step->role) {
                    $stepRoleName = $step->role->name;
                    $hasRole = $currentUser->hasRole($stepRoleName)
                        || $currentUser->hasRole(Roles::SUPER_ADMIN);

                    $alreadyApproved = $this->comments
                        ? $this->comments
                            ->where('user_id', $currentUser->id)
                            ->where('steps', $this->step)
                            ->whereNotNull('approved_at')
                            ->isNotEmpty()
                        : false;

                    $canApprove = $hasRole && !$alreadyApproved;

                    // Executive Director can act as Director Department for bills
                    // assigned directly to their own department (no dept director exists there)
                    if (!$canApprove && $currentUser->hasRole(Roles::EXECUTIVE_DIRECTOR)
                        && $this->assigned_dep_id == $currentUser->department_id) {
                        $canApprove = !$alreadyApproved;
                    }
                }
            } else {
                // Legacy
                if ($this->step == 1 && $this->status <= 2) {
                    $canApprove = $currentUser->hasRole(Roles::DIRECTOR_DEPARTMENT)
                        || $currentUser->hasRole(Roles::LEGAL_OFFICE)
                        || $currentUser->hasRole(Roles::SUPER_ADMIN);
                } elseif ($this->step == 2 && $this->status == 2) {
                    $canApprove = $currentUser->hasRole(Roles::EXECUTIVE_DIRECTOR)
                        || $currentUser->hasRole(Roles::SUPER_ADMIN);
                } elseif ($this->step == 3 && $this->status == 3) {
                    $canApprove = $currentUser->hasRole(Roles::SUPER_ADMIN);
                }
            }

            // --- workflow_step_label: human-readable "awaiting" string ---
            if ($this->status == 7) {
                $workflowStepLabel = 'delivered_to_finances';
            } elseif ($this->status == 6) {
                $workflowStepLabel = 'printed_closed';
            } elseif ($this->status == 3) {
                $workflowStepLabel = 'approved_waiting_print';
            } elseif ($this->workflow_template_id && $this->workflowTemplate) {
                $step = $this->workflowTemplate->getStepByOrder($this->step);
                $workflowStepLabel = $step && $step->role ? $step->role->name : null;
            }
        }

        return [
            'id' => $this->id,
            'name' => $this->name ?? null,
            'type' => $this->type ?? null,
            'value' => $this->value ?? null,
            'bill_no' => $this->bill_no ?? null,
            'description' => $this->description ?? null,
            'accepted' => $this->accepted ?? null,
            'created_by' => [
                'id' => $this->createdBy ? $this->createdBy->id : null,
                'first_name' => $this->createdBy ? $this->createdBy->first_name : null,
                'last_name' => $this->createdBy ? $this->createdBy->last_name : null
            ],
            'updated_by' => [
                'id' => $this->updatedBy ? $this->updatedBy->id : null,
                'first_name' => $this->updatedBy ? $this->updatedBy->first_name : null,
                'last_name' => $this->updatedBy ? $this->updatedBy->last_name : null
            ],
            'supplier' => $this->supplierName ? $this->supplierName->name : null,
            'step' => $this->step ?? null,
            'status' => $this->status ?? null,
            'created_at' => $this->created_at ?? null,
            'updated_at' => $this->updated_at ?? null,
            'comments' => $this->comments ? BillCommentsResource::collection($this->comments) : null,
            'files' => $this->files ? BillFilesResource::collection($this->files) : null,
            'assigned_dep_id' => $this->departmentName ? $this->departmentName->name : null,
            'assigned_dep_id_raw' => $this->assigned_dep_id ?? null,
            'approved_first' => $this->approved_first ?? null,
            'approved_second' => $this->approved_second ?? null,
            'workflow_template_id' => $this->workflow_template_id ?? null,
            'workflow_template' => $this->whenLoaded('workflowTemplate', function () {
                if (!$this->workflowTemplate) return null;
                return [
                    'id' => $this->workflowTemplate->id,
                    'name' => $this->workflowTemplate->name,
                    'steps' => $this->workflowTemplate->steps->map(function ($s) {
                        return [
                            'id' => $s->id,
                            'step_order' => $s->step_order,
                            'name' => $s->name ?? null,
                            'role' => $s->role ? [
                                'id' => $s->role->id,
                                'name' => $s->role->name,
                            ] : null,
                        ];
                    })->values(),
                ];
            }),
            'workflow_step_label' => $workflowStepLabel,
            'can_approve' => $canApprove,
            'can_print' => $canPrint,
        ];
    }
}
