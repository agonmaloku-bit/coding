<?php

namespace Database\Seeders;

use App\Enums\Permissions;
use App\Enums\Roles;
use App\Logic\ClassConstants;
use Illuminate\Database\Seeder;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Support\Str;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = ClassConstants::getClassConstants('\App\Enums\Permissions');
        $comments = self::permissionComments();
        foreach ($permissions as $permission) {
            $comment = $comments[$permission] ?? null;
            $existing = Permission::where('name', $permission)->first();
            if (!$existing) {
                Permission::create(['name' => $permission, 'comment' => $comment]);
            } elseif ($comment && $existing->comment !== $comment) {
                $existing->comment = $comment;
                $existing->save();
            }
        }

        $guardName = config('auth.defaults.guard', 'web');

        foreach (self::roles() as $roleData) {
            $role = Role::updateOrCreate(['name' => $roleData['name'], 'guard_name' => $guardName], [
                'name' => $roleData['name'],
                'guard_name' => $guardName,
                'description' => $roleData['description'],
                'slug' => Str::of($roleData['name'])->snake(),
            ]);

            $role->syncPermissions($roleData['permissions'] === ['*'] ? Permission::all() : $roleData['permissions']);
        }
    }

    public static function roles(): array
    {
        return [
            ['name' => Roles::SUPER_ADMIN, 'description' => Roles::SUPER_ADMIN_DESCRIPTION, 'permissions' => ['*']],
            ['name' => Roles::SECURITY, 'description' => 'Security', 'permissions' => []],
            ['name' => Roles::TRANSPORT, 'description' => 'Transport', 'permissions' => []],
            ['name' => Roles::LEGAL_OFFICE, 'description' => Roles::LEGAL_OFFICE_DESCRIPTION, 'permissions' => [
                Permissions::DEPARTMENTS_SHOW,
                Permissions::COMPANY_SHOW,
                Permissions::CONTRACT_TYPE_SHOW_ALL,
                Permissions::CONTRACT_TYPE_SHOW,
                Permissions::CONTRACT_TYPE_ADD,
                Permissions::CONTRACT_TYPE_EDIT,
                Permissions::RESPONSIBLE_PERSON_SHOW,
                Permissions::PROCUREMENT_OFFICER_SHOW,
                Permissions::DIRECTOR_DEPARTMENT_SHOW,
                Permissions::LEGAL_OFFICE_SHOW_ALL,
                Permissions::LEGAL_OFFICE_SHOW,
                Permissions::CONTRACT_ARCHIVE,
                Permissions::CONTRACT_SHOW_ALL,
                Permissions::CONTRACT_SHOW,
                Permissions::CONTRACT_ADD,
                Permissions::CONTRACT_REQUEST,
                Permissions::CONTRACT_EDIT,
                Permissions::CONTRACT_APPROVE,
                Permissions::CONTRACT_ATTACHMENTS,
                Permissions::BILL_ADD,
                Permissions::BILL_EDIT,
                Permissions::BILL_DELETE,
                Permissions::BILL_REQUEST,
                Permissions::BILL_ATTACHMENTS,
                Permissions::SUPPLIER_SHOW,
                Permissions::SUPPLIER_ADD,
                Permissions::SUPPLIER_EDIT,
                Permissions::REPORTS_SHOW_ALL,
                Permissions::REPORTS_SHOW,
            ]],
            ['name' => Roles::EXECUTIVE_DIRECTOR, 'description' => Roles::EXECUTIVE_DIRECTOR_DESCRIPTION, 'permissions' => [
                Permissions::CONTRACT_SHOW_ALL,
                Permissions::CONTRACT_SHOW,
                Permissions::CONTRACT_EDIT,
                Permissions::CONTRACT_APPROVE,
                Permissions::CONTRACT_ATTACHMENTS,
                Permissions::BILL_ADD,
                Permissions::BILL_EDIT,
                Permissions::BILL_DELETE,
                Permissions::BILL_REQUEST,
                Permissions::BILL_APPROVE,
                Permissions::BILL_CANCEL,
                Permissions::BILL_ATTACHMENTS,
                Permissions::REPORTS_SHOW_ALL,
                Permissions::REPORTS_SHOW,
                Permissions::BILL_VERIFY_AI,
            ]],
            ['name' => Roles::DIRECTOR_DEPARTMENT, 'description' => Roles::DIRECTOR_DEPARTMENT_DESCRIPTION, 'permissions' => [
                Permissions::CONTRACT_SHOW_ALL,
                Permissions::CONTRACT_SHOW,
                Permissions::CONTRACT_ADD,
                Permissions::CONTRACT_REQUEST,
                Permissions::CONTRACT_EDIT,
                Permissions::CONTRACT_APPROVE,
                Permissions::CONTRACT_ATTACHMENTS,
                Permissions::SUPPLIER_SHOW,
            ]],
            ['name' => Roles::PROCUREMENT_OFFICER, 'description' => Roles::PROCUREMENT_OFFICER_DESCRIPTION, 'permissions' => [
                Permissions::CONTRACT_SHOW_ALL,
                Permissions::CONTRACT_SHOW,
                Permissions::CONTRACT_REQUEST,
                Permissions::CONTRACT_EDIT,
                Permissions::CONTRACT_APPROVE,
                Permissions::CONTRACT_ATTACHMENTS,
                Permissions::BILL_SHOW_ALL,
                Permissions::BILL_SHOW,
                Permissions::BILL_ADD,
                Permissions::BILL_EDIT,
                Permissions::BILL_DELETE,
                Permissions::BILL_REQUEST,
                Permissions::BILL_CANCEL,
                Permissions::BILL_ATTACHMENTS,
                Permissions::SUPPLIER_SHOW,
                Permissions::SUPPLIER_ADD,
                Permissions::SUPPLIER_EDIT,
                Permissions::SUPPLIER_SHOW_ALL,
                Permissions::REPORTS_SHOW_ALL,
                Permissions::REPORTS_SHOW,
                Permissions::REPORTS_ADD,
            ]],
            ['name' => Roles::RESPONSIBLE_PERSON, 'description' => Roles::RESPONSIBLE_PERSON_DESCRIPTION, 'permissions' => [
                Permissions::CONTRACT_SHOW_ALL,
                Permissions::CONTRACT_SHOW,
                Permissions::CONTRACT_APPROVE,
                Permissions::BILL_ADD,
                Permissions::BILL_EDIT,
                Permissions::BILL_DELETE,
                Permissions::BILL_REQUEST,
                Permissions::BILL_ATTACHMENTS,
            ]],
            ['name' => Roles::ADMIN, 'description' => Roles::ADMIN_DESCRIPTION, 'permissions' => [
                Permissions::DEPARTMENTS_SHOW_ALL,
                Permissions::DEPARTMENTS_SHOW,
                Permissions::RESPONSIBLE_PERSON_SHOW_ALL,
                Permissions::RESPONSIBLE_PERSON_SHOW,
                Permissions::PROCUREMENT_OFFICER_SHOW_ALL,
                Permissions::PROCUREMENT_OFFICER_SHOW,
                Permissions::CONTRACT_SHOW_ALL,
                Permissions::CONTRACT_SHOW,
                Permissions::BILL_SHOW_ALL,
                Permissions::BILL_SHOW,
                Permissions::BILL_ADD,
                Permissions::BILL_EDIT,
                Permissions::BILL_DELETE,
                Permissions::BILL_REQUEST,
                Permissions::BILL_APPROVE,
                Permissions::BILL_CANCEL,
                Permissions::BILL_ATTACHMENTS,
                Permissions::SUPPLIER_SHOW,
                Permissions::SUPPLIER_ADD,
                Permissions::SUPPLIER_EDIT,
                Permissions::SUPPLIER_DELETE,
                Permissions::SUPPLIER_SHOW_ALL,
                Permissions::REPORTS_SHOW_ALL,
                Permissions::REPORTS_SHOW,
                Permissions::BILL_VERIFY_AI,
            ]],
        ];
    }

    /**
     * Human-readable description for each permission, persisted to the
     * `permissions.comment` column so future maintainers know what each
     * permission actually unlocks in the application.
     *
     * @return array<string,string>
     */
    public static function permissionComments(): array
    {
        return [
            // Users
            Permissions::USERS_SHOW_All       => 'View the list of all users in the system.',
            Permissions::USERS_SHOW           => 'View a single user profile / details.',
            Permissions::USERS_ADD            => 'Create a new user account.',
            Permissions::USERS_EDIT           => 'Edit an existing user (name, email, role, status).',
            Permissions::USERS_DELETE         => 'Soft-delete / deactivate a user.',

            // Roles
            Permissions::ROLES_SHOW_All       => 'View the list of all roles.',
            Permissions::ROLES_SHOW           => 'View a single role with its permissions.',
            Permissions::ROLES_EDIT           => 'Create / rename / delete roles and assign their permissions.',

            // Permissions
            Permissions::PERMISSIONS_SHOW_ALL => 'View the full permissions catalogue.',
            Permissions::PERMISSIONS_SHOW     => 'View a single permission entry.',
            Permissions::PERMISSIONS_EDIT     => 'Create / rename / delete permission entries.',

            // Departments
            Permissions::DEPARTMENTS_SHOW_ALL => 'View the list of all departments.',
            Permissions::DEPARTMENTS_SHOW     => 'View a single department.',
            Permissions::DEPARTMENTS_ADD      => 'Create a new department.',
            Permissions::DEPARTMENTS_EDIT     => 'Edit an existing department.',
            Permissions::DEPARTMENTS_DELETE   => 'Delete a department.',

            // Companies
            Permissions::COMPANY_SHOW_ALL     => 'View the list of all companies.',
            Permissions::COMPANY_SHOW         => 'View a single company.',
            Permissions::COMPANY_ADD          => 'Create a new company.',
            Permissions::COMPANY_EDIT         => 'Edit company details (name, logo, business no, address).',
            Permissions::COMPANY_DELETE       => 'Delete a company.',

            // Contract types
            Permissions::CONTRACT_TYPE_SHOW_ALL => 'View all contract types.',
            Permissions::CONTRACT_TYPE_SHOW     => 'View a single contract type.',
            Permissions::CONTRACT_TYPE_ADD      => 'Create a new contract type.',
            Permissions::CONTRACT_TYPE_EDIT     => 'Edit an existing contract type.',
            Permissions::CONTRACT_TYPE_DELETE   => 'Delete a contract type.',

            // Org users (responsible person, procurement officer, directors, legal)
            Permissions::RESPONSIBLE_PERSON_SHOW_ALL  => 'View all responsible persons.',
            Permissions::RESPONSIBLE_PERSON_SHOW      => 'View a single responsible person.',
            Permissions::RESPONSIBLE_PERSON_ADD       => 'Assign a user as responsible person.',
            Permissions::RESPONSIBLE_PERSON_EDIT      => 'Edit a responsible person assignment.',
            Permissions::RESPONSIBLE_PERSON_DELETE    => 'Remove a responsible person assignment.',

            Permissions::PROCUREMENT_OFFICER_SHOW_ALL => 'View all procurement officers.',
            Permissions::PROCUREMENT_OFFICER_SHOW     => 'View a single procurement officer.',
            Permissions::PROCUREMENT_OFFICER_ADD      => 'Assign a user as procurement officer.',
            Permissions::PROCUREMENT_OFFICER_EDIT     => 'Edit a procurement officer assignment.',
            Permissions::PROCUREMENT_OFFICER_DELETE   => 'Remove a procurement officer assignment.',

            Permissions::DIRECTOR_DEPARTMENT_SHOW_ALL => 'View all department directors.',
            Permissions::DIRECTOR_DEPARTMENT_SHOW     => 'View a single department director.',
            Permissions::DIRECTOR_DEPARTMENT_ADD      => 'Assign a user as department director.',
            Permissions::DIRECTOR_DEPARTMENT_EDIT     => 'Edit a department director assignment.',
            Permissions::DIRECTOR_DEPARTMENT_DELETE   => 'Remove a department director assignment.',

            Permissions::EXECUTIVE_DIRECTOR_SHOW_ALL  => 'View all executive directors.',
            Permissions::EXECUTIVE_DIRECTOR_SHOW      => 'View a single executive director.',
            Permissions::EXECUTIVE_DIRECTOR_ADD       => 'Assign a user as executive director.',
            Permissions::EXECUTIVE_DIRECTOR_EDIT      => 'Edit an executive director assignment.',
            Permissions::EXECUTIVE_DIRECTOR_DELETE    => 'Remove an executive director assignment.',

            Permissions::LEGAL_OFFICE_SHOW_ALL => 'View all legal-office users.',
            Permissions::LEGAL_OFFICE_SHOW     => 'View a single legal-office user.',
            Permissions::LEGAL_OFFICE_ADD      => 'Assign a user to the legal office.',
            Permissions::LEGAL_OFFICE_EDIT     => 'Edit a legal-office assignment.',
            Permissions::LEGAL_OFFICE_DELETE   => 'Remove a legal-office assignment.',

            // Contracts
            Permissions::CONTRACT_ARCHIVE     => 'Move a contract into the archive.',
            Permissions::CONTRACT_SHOW_ALL    => 'View the list of all contracts.',
            Permissions::CONTRACT_SHOW        => 'View a single contract and its details.',
            Permissions::CONTRACT_ADD         => 'Create a new contract.',
            Permissions::CONTRACT_REQUEST     => 'Submit a contract for approval.',
            Permissions::CONTRACT_EDIT        => 'Edit an existing contract.',
            Permissions::CONTRACT_DELETE      => 'Delete a contract.',
            Permissions::CONTRACT_APPROVE     => 'Approve a contract step in the workflow.',
            Permissions::CONTRACT_ATTACHMENTS => 'Upload / download / remove contract attachments.',

            // Bills
            Permissions::BILL_SHOW_ALL    => 'View the list of all bills.',
            Permissions::BILL_SHOW        => 'View a single bill and its details.',
            Permissions::BILL_ADD         => 'Create a new bill.',
            Permissions::BILL_EDIT        => 'Edit an existing bill.',
            Permissions::BILL_DELETE      => 'Delete a bill.',
            Permissions::BILL_REQUEST     => 'Submit a bill for approval.',
            Permissions::BILL_APPROVE     => 'Approve a bill step in the workflow.',
            Permissions::BILL_CANCEL      => 'Cancel a bill.',
            Permissions::BILL_ATTACHMENTS => 'Upload / download / remove bill attachments.',
            Permissions::BILL_VERIFY_AI   => 'Run the AI invoice verification on a bill (compares the form against the attached invoice).',

            // Suppliers
            Permissions::SUPPLIER_SHOW_ALL => 'View the list of all suppliers.',
            Permissions::SUPPLIER_SHOW     => 'View a single supplier.',
            Permissions::SUPPLIER_ADD      => 'Create a new supplier (incl. NUI auto-fill).',
            Permissions::SUPPLIER_EDIT     => 'Edit an existing supplier.',
            Permissions::SUPPLIER_DELETE   => 'Delete a supplier.',

            // Procurement requests
            Permissions::PROCUREMENT_SHOW_ALL => 'View all procurement requests.',
            Permissions::PROCUREMENT_SHOW    => 'View a single procurement request.',
            Permissions::PROCUREMENT_REQUEST => 'Create / submit a procurement request.',
            Permissions::PROCUREMENT_EDIT    => 'Edit an existing procurement request.',
            Permissions::PROCUREMENT_DELETE  => 'Delete a procurement request.',
            Permissions::PROCUREMENT_APPROVE => 'Approve a procurement request step.',
            Permissions::PROCUREMENT_CANCEL  => 'Cancel a procurement request.',

            // Business apps / app roles
            Permissions::APP_ROLES_MANAGE => 'Manage business-app role assignments for users.',

            // Reports (procesverbal of bills delivered to finance, etc.)
            Permissions::REPORTS_SHOW_ALL => 'View the list of all generated reports (procesverbal).',
            Permissions::REPORTS_SHOW     => 'Open / download an individual report PDF.',
            Permissions::REPORTS_ADD      => 'Generate a new report (e.g. procesverbal for selected bills).',
            Permissions::REPORTS_EDIT     => 'Edit metadata of an existing report (reserved for future use).',
            Permissions::REPORTS_DELETE   => 'Delete a previously generated report.',
        ];
    }
}
