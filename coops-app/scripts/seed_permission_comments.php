<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Enums\Permissions;
use App\Enums\Roles;
use App\Models\Permission;
use App\Models\Role;
use App\Logic\ClassConstants;
use Database\Seeders\RolesAndPermissionsSeeder;

app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

$comments = RolesAndPermissionsSeeder::permissionComments();
$names = ClassConstants::getClassConstants('\App\Enums\Permissions');
$created = 0;
$updated = 0;
foreach ($names as $n) {
    $c = $comments[$n] ?? null;
    $p = Permission::where('name', $n)->first();
    if (!$p) {
        Permission::create(['name' => $n, 'comment' => $c]);
        $created++;
    } elseif ($c && $p->comment !== $c) {
        $p->comment = $c;
        $p->save();
        $updated++;
    }
}
echo "Permissions created: {$created}\n";
echo "Permissions comment-updated: {$updated}\n";

$grants = [
    Roles::PROCUREMENT_OFFICER => [Permissions::REPORTS_SHOW_ALL, Permissions::REPORTS_SHOW, Permissions::REPORTS_ADD],
    Roles::ADMIN              => [Permissions::REPORTS_SHOW_ALL, Permissions::REPORTS_SHOW],
    Roles::EXECUTIVE_DIRECTOR => [Permissions::REPORTS_SHOW_ALL, Permissions::REPORTS_SHOW],
    Roles::LEGAL_OFFICE       => [Permissions::REPORTS_SHOW_ALL, Permissions::REPORTS_SHOW],
];
foreach ($grants as $roleName => $perms) {
    $role = Role::where('name', replace_whites($roleName))->first();
    if ($role) {
        $role->givePermissionTo($perms);
        echo "Granted Reports perms to: {$roleName}\n";
    }
}

$super = Role::where('name', replace_whites(Roles::SUPER_ADMIN))->first();
if ($super) {
    $super->syncPermissions(Permission::all());
    echo "Super admin synced with all permissions\n";
}

app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
echo "Done.\n";
