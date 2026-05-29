<?php

namespace App\Helpers;

use App\Helpers\Contracts\UserAuthInterface;
use Illuminate\Auth\AuthManager;

class UserAuth implements UserAuthInterface
{
    protected $auth;

    public function __construct(AuthManager $auth)
    {
        $this->auth = $auth;
    }

    public function getUser()
    {
        if ($this->auth->check()) {
            return $this->auth->user();
        }
    }

    public function getUserId()
    {
        if($this->auth->check()){
            return $this->auth->id();
        }
    }

    public function getUserDepartmentId()
    {
        if($this->auth->check()) {
            return $this->auth->user()->department->id;
        }
        // Get auth user role department
    }
}
