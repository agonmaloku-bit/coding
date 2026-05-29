<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginPostRequest;
use App\Http\Requests\Auth\ProfilePostRequest;
use App\Http\Requests\Auth\RegisterPostRequest;
use App\Http\Resources\AuthenticationResource;
use App\Mediators\Auth\Contracts\AuthenticationMediatorInterface;
use Illuminate\Http\Request;

class AuthenticationController extends Controller
{

    private $authMediator;

    public function __construct(AuthenticationMediatorInterface $authenticationMediator)
    {
        $this->authMediator = $authenticationMediator;
    }

    public function login(LoginPostRequest $request)
    {
        $attributes = $request->validated();

        $response = $this->authMediator->loginUser($attributes);

        return new AuthenticationResource($response);
    }

    public function register(RegisterPostRequest $request)
    {
        $attributes = $request->validated();

        $response = $this->authMediator->createUser($attributes);

        return new AuthenticationResource($response);
    }

    public function logout(Request $request)
    {
        $response = $this->authMediator->logout($request);

        return new AuthenticationResource($response);
    }

    public function postProfile(ProfilePostRequest $request)
    {
        return $this->authMediator->saveProfileData($request);
    }

    public function getUser()
    {
        return $this->authMediator->getCurrentUser();
    }
}
