<?php

namespace App\Logic;

use Illuminate\Support\Str;

class Departments
{
    public static function getDepartmentAccesor($depId, $role)
    {
    //        $name = str_replace(' ', '_', strtolower($departmentName));
        return "{$depId}|{$role}";
    }
}
