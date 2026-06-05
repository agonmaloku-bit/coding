<?php

namespace App\Providers;

use App\Mediators\Auth\AuthenticationMediator;
use App\Mediators\Auth\Contracts\AuthenticationMediatorInterface;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array
     */
    protected $policies = [
        // 'App\Models\Model' => 'App\Policies\ModelPolicy',
    ];

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();

        $this->app->bind(AuthenticationMediatorInterface::class, AuthenticationMediator::class);

        Gate::before(function ($user, $ability) {
            if ($user->hasRole('Super Admin')) {
                return true;
            }
        });
    }
}
