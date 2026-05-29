<?php

namespace App\Providers;

use App\Helpers\UserAuth;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;

class UserAuthServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind('userAuth', function () {
            return new UserAuth(Auth::getFacadeRoot());
        });
    }

    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {
        //
    }
}
