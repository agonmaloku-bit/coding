<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

interface EloquentRepositoryInterface
{
    /**
     * @return Collection
     */
    public function all();

    /**
     * @param $id
     * @return Model
     */
    public function find($id);

    /**
     * @param array $attributes
     * @return Model
     */
    public function store(array $attributes);

    /**
     * @param $id
     * @param array $attributes
     * @return Bool
     */
    public function update($id, array $attributes);

    public function destroy($id);
}
