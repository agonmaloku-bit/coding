<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\WorkflowTemplate;
use App\Models\WorkflowStep;

/**
 * Seeds the default 3-step bill approval workflow:
 *   Step 1 – Director Department  → bill moves to PENDING (status 2)
 *   Step 2 – Executive Director   → bill moves to APPROVED FROM CEO (status 3)
 *   Step 3 – Super Admin          → bill moves to APPROVED FROM ADMIN (status 5, final)
 */
class BillWorkflowSeeder extends Seeder
{
    public function run()
    {
        // Role IDs (from spatie roles table):
        // 1 = Super Admin | 5 = Director Department | 6 = Executive Director
        $roleDirectorDept   = 5;
        $roleExecutiveDir   = 6;
        $roleSuperAdmin     = 1;

        // Idempotent: if template already exists, just ensure all steps are present
        $existing = WorkflowTemplate::where('type', 'bill')->where('is_default', true)->first();
        if ($existing) {
            $this->seedSteps($existing->id, $roleDirectorDept, $roleExecutiveDir, $roleSuperAdmin);
            $count = WorkflowStep::where('workflow_template_id', $existing->id)->count();
            $this->command->info('Bill workflow template already exists (id=' . $existing->id . ', steps=' . $count . ') – ensured all steps present.');
            return;
        }

        $template = WorkflowTemplate::create([
            'name'       => 'Standard Bill Approval Flow',
            'type'       => 'bill',
            'is_default' => true,
            'is_active'  => true,
        ]);

        $this->seedSteps($template->id, $roleDirectorDept, $roleExecutiveDir, $roleSuperAdmin);

        $created = WorkflowStep::where('workflow_template_id', $template->id)->count();
        $this->command->info('Bill workflow template seeded (id=' . $template->id . ', steps=' . $created . ').');
    }

    private function seedSteps(int $templateId, int $directorRole, int $ceoRole, int $adminRole): void
    {
        $steps = [
            [
                'step_order'  => 1,
                'name'        => 'Department Director Approval',
                'role_id'     => $directorRole,
                'notify_roles' => [$ceoRole],
                'description' => 'Director of the responsible department approves the bill request.',
            ],
            [
                'step_order'  => 2,
                'name'        => 'CEO Approval',
                'role_id'     => $ceoRole,
                'notify_roles' => [$adminRole],
                'description' => 'Executive Director (CEO) reviews and approves the bill.',
            ],
            [
                'step_order'  => 3,
                'name'        => 'Admin Final Approval',
                'role_id'     => $adminRole,
                'notify_roles' => [],
                'description' => 'Super Admin gives final approval for payment processing.',
            ],
        ];

        foreach ($steps as $stepData) {
            WorkflowStep::firstOrCreate(
                [
                    'workflow_template_id' => $templateId,
                    'step_order'           => $stepData['step_order'],
                ],
                array_merge($stepData, ['workflow_template_id' => $templateId])
            );
        }
    }
}
