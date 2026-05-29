<?php

namespace App\Repositories;

use App\Enums\Roles;
use App\Repositories\Contracts\PermissionRepositoryInterface;
use App\Models\Permission;

class PermissionRepository extends BaseRepository implements PermissionRepositoryInterface
{
    public function __construct(Permission $model)
    {
        parent::__construct($model);
    }

    public function getAll()
    {
        if (request()->has('page'))
        {
            return $this->model
                ->orderByDesc('id')
                ->paginate(10);
        }

        return parent::all();
    }

    public function getAllPermissionsByRoleIds($ids)
    {
//        return $this->model
//            ->with(['roles' => function($query) use ($ids) {
//                $query->whereIn('id', [$ids]);
//            }])->get();

        return $this->model
            ->whereHas('roles', function ($q) use ($ids) {
                $q->whereIn('id', [$ids]);
            })->get();
    }
}
