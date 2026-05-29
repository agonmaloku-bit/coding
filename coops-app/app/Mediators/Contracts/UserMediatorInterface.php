<?php

namespace App\Mediators\Contracts;

interface UserMediatorInterface
{
    public function getAll();

    public function findById($id);

    public function storeUser($request);

    public function updateUserById($request, $id);

    public function deleteUserById($id);
}
