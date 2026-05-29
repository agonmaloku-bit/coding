<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;

interface DepartmentRepositoryInterface
{
    public function getAll();

    public function countAll();
}
