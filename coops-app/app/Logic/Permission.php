<?php

namespace App\Logic;

use App\Http\Resources\ResponseResource;

class Permission
{
    public static function hasPermissionTo($permission)
    {
        $user = request()->user();
        if ($user && $user->hasRole('Super Admin')) {
            return true;
        }

        if ($user->hasAnyPermission($permission, 'web'))
        {
            return true;
        }
        return false;
    }
}
