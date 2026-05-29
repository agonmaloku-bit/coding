<?php

namespace App\Logic;

use App\Enums\Permissions;
use App\Enums\Roles;
use App\Enums\Status;
use App\Models\WorkflowTemplate;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\Contracts\WorkflowTemplateRepositoryInterface;

class WorkflowEngine
{
    private $userRepository;
    private $workflowTemplateRepository;

    public function __construct(
        UserRepositoryInterface $userRepository,
        WorkflowTemplateRepositoryInterface $workflowTemplateRepository
    ) {
        $this->userRepository = $userRepository;
        $this->workflowTemplateRepository = $workflowTemplateRepository;
    }

    /**
     * Resolve which workflow template applies to a given entity.
     * Priority: entity's assigned template > company-specific > default for type.
     */
    public function resolveTemplate($entity, $type, $companyId = null)
    {
        // If entity already has a workflow template assigned
        if ($entity->workflow_template_id) {
            return WorkflowTemplate::with('steps.role')->find($entity->workflow_template_id);
        }

        // Try company-specific, then fall back to default
        return $this->workflowTemplateRepository->getDefaultByType($type, $companyId);
    }

    /**
     * Process an approval action on an entity (contract or bill).
     * Returns: ['success' => bool, 'final' => bool, 'step' => WorkflowStep|null, 'notifications' => array]
     */
    public function processApproval($entity, $template, $user)
    {
        if (!$template) {
            return ['success' => false, 'message' => 'No workflow template assigned'];
        }

        $currentStepOrder = $entity->step;

        // Find current step definition
        $currentStep = $template->getStepByOrder($currentStepOrder);

        if (!$currentStep) {
            // Super Admin can always advance
            if ($user->hasRole(Roles::SUPER_ADMIN)) {
                return $this->advanceStep($entity, $template, $currentStepOrder);
            }
            return ['success' => false, 'message' => 'Invalid step'];
        }

        // Check if user has the required role for this step
        $requiredRole = $currentStep->role->name;
        $hasRequiredRole = $user->hasRole($requiredRole) || $user->hasRole(Roles::SUPER_ADMIN);

        // Executive Director can act as Director Department for bills assigned to their own department
        if (!$hasRequiredRole && $user->hasRole(Roles::EXECUTIVE_DIRECTOR)) {
            $entityDeptId = $entity->assigned_dep_id ?? null;
            $userDeptId = $user->department_id ?? null;
            if ($entityDeptId && $userDeptId && $entityDeptId == $userDeptId) {
                $hasRequiredRole = true;
            }
        }

        if (!$hasRequiredRole) {
            return ['success' => false, 'message' => 'You do not have the required role for this step'];
        }

        // The acting user must also carry the matching approve permission
        // (Contract Approve / Bill Approve). Super Admin bypasses this check
        // because it implicitly has every permission.
        if (!$user->hasRole(Roles::SUPER_ADMIN)) {
            $approvePermission = $this->resolveApprovePermission($entity);
            if ($approvePermission && !$user->can($approvePermission)) {
                return [
                    'success' => false,
                    'message' => 'You do not have the "' . $approvePermission . '" permission required to approve this step',
                ];
            }
        }

        // Prevent the same user from approving the same step twice
        if ($this->hasUserAlreadyApprovedStep($entity, $currentStepOrder, $user->id)) {
            return ['success' => false, 'message' => 'You have already approved this step'];
        }

        return $this->advanceStep($entity, $template, $currentStepOrder);
    }

    /**
     * Map an entity model to the permission name required for approving its
     * workflow steps. Returns null when no specific permission applies (the
     * role-based check then stands on its own).
     */
    private function resolveApprovePermission($entity): ?string
    {
        if ($entity instanceof \App\Models\Contract) {
            return Permissions::CONTRACT_APPROVE;
        }
        if ($entity instanceof \App\Models\Bill) {
            return Permissions::BILL_APPROVE;
        }
        return null;
    }

    /**
     * Check if a user already submitted an approval comment at a given step.
     */
    private function hasUserAlreadyApprovedStep($entity, $stepOrder, $userId)
    {
        if (!method_exists($entity, 'comments')) {
            return false;
        }

        return $entity->comments()
            ->where('user_id', $userId)
            ->where('steps', $stepOrder)
            ->whereNotNull('approved_at')
            ->exists();
    }

    /**
     * Advance to the next step.
     */
    private function advanceStep($entity, $template, $currentStepOrder)
    {
        $nextStep = $template->getNextStep($currentStepOrder);

        if ($nextStep) {
            // There are more steps
            $entity->step = $nextStep->step_order;
            $entity->status = Status::IN_PROGRESS;
            $entity->save();

            return [
                'success' => true,
                'final' => false,
                'currentStep' => $template->getStepByOrder($currentStepOrder),
                'nextStep' => $nextStep,
                'notifications' => $this->getNotificationRecipients($nextStep),
            ];
        } else {
            // No more steps — approved!
            $entity->step = $currentStepOrder + 1;
            $entity->status = Status::APPROVED;
            $entity->save();

            return [
                'success' => true,
                'final' => true,
                'currentStep' => $template->getStepByOrder($currentStepOrder),
                'nextStep' => null,
                'notifications' => [],
            ];
        }
    }

    /**
     * Get email recipients for a step based on its notify_roles config.
     */
    public function getNotificationRecipients($step)
    {
        $recipients = [];

        if (!$step || !$step->notify_roles) {
            return $recipients;
        }

        foreach ($step->notify_roles as $roleId) {
            $role = \Spatie\Permission\Models\Role::find($roleId);
            if ($role) {
                $users = $this->userRepository->getAllUsersByRoles($role->name);
                foreach ($users as $user) {
                    $recipients[] = $user['email'];
                }
            }
        }

        return array_unique($recipients);
    }
}
