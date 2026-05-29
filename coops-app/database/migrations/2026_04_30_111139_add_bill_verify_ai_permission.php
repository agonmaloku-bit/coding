<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class AddBillVerifyAiPermission extends Migration
{
    /**
     * Adds the new "Bill Verify AI" permission and grants it to every role
     * that already has "Bill Approve" (so anyone who can approve a bill can
     * also run the AI verification). Also grants it to "Super Admin" if not
     * already covered.
     */
    public function up()
    {
        $name = 'Bill Verify AI';
        $now  = now();

        $exists = DB::table('permissions')->where('name', $name)->first();
        if (!$exists) {
            DB::table('permissions')->insert([
                'name'       => $name,
                'comment'    => 'Run the AI invoice verification on a bill (compares the form against the attached invoice).',
                'guard_name' => 'web',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $permId = DB::table('permissions')->where('name', $name)->value('id');
        if (!$permId) return;

        // Grant to every role that already has Bill Approve
        $approveId = DB::table('permissions')->where('name', 'Bill Approve')->value('id');
        $roleIds = collect();
        if ($approveId) {
            $roleIds = DB::table('role_has_permissions')
                ->where('permission_id', $approveId)
                ->pluck('role_id');
        }

        // Always include Super Admin
        $superAdminId = DB::table('roles')->where('name', 'Super Admin')->value('id');
        if ($superAdminId) {
            $roleIds = $roleIds->push($superAdminId);
        }

        foreach ($roleIds->unique()->filter()->all() as $rid) {
            DB::table('role_has_permissions')->updateOrInsert(
                ['role_id' => $rid, 'permission_id' => $permId],
                ['role_id' => $rid, 'permission_id' => $permId]
            );
        }

        // Bust the spatie permission cache.
        if (class_exists(\Spatie\Permission\PermissionRegistrar::class)) {
            app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
        }
    }

    public function down()
    {
        $name = 'Bill Verify AI';
        $permId = DB::table('permissions')->where('name', $name)->value('id');
        if ($permId) {
            DB::table('role_has_permissions')->where('permission_id', $permId)->delete();
            DB::table('model_has_permissions')->where('permission_id', $permId)->delete();
            DB::table('permissions')->where('id', $permId)->delete();
        }
    }
}
