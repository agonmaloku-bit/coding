<?php

namespace App\Models;

use Spatie\Permission\Models\Role as BaseRole;

class Role extends BaseRole
{
//    public function department()
//    {
//        return $this->belongsTo(Department::class);
//    }

    public function departments()
    {
        return $this->belongsToMany(Department::class, 'department_role');
    }
}
