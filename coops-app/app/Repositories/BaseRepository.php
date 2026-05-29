<?php

namespace App\Repositories;

use App\Repositories\Contracts\EloquentRepositoryInterface;
use Illuminate\Database\Eloquent\Model;

class BaseRepository implements EloquentRepositoryInterface
{
    /**
     * @var Model
     */
    protected $model;

    /**
     * BaseRepository constructor.
     *
     * @param Model $model
     */
    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    public function all()
    {
        return $this->model
            ->orderByDesc('id')
            ->get();
    }

    public function find($id)
    {
        return $this->model
            ->find($id);
    }

    public function store(array $attributes): ?Model
    {
        return $this->model
            ->create($attributes);
    }

    public function update($id, array $attributes)
    {
        return $this->model
            ->find($id)
            ->update($attributes);
    }

    public function destroy($id)
    {
        return $this->model
            ->destroy($id);
    }
}
