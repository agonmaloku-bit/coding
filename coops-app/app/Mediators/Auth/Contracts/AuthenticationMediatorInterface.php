<?php

namespace App\Mediators\Auth\Contracts;

use Illuminate\Http\Request;

interface AuthenticationMediatorInterface
{
    public function loginUser($attr);

    public function createUser($attributes);

    public function logout(Request $request);

    public function saveProfileData($request);

    public function getCurrentUser();
}
