<?php

namespace App\Mediators\Auth;

use App\Mediators\Auth\Contracts\AuthenticationMediatorInterface;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Passport\Passport;
use Spatie\Permission\Models\Permission;

class AuthenticationMediator implements AuthenticationMediatorInterface
{
    private $userRepository;

    public function __construct(UserRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function loginUser($attr)
    {
        if (!Auth::attempt($attr)) {
            return ['error' => true];
        }

        if (request()->input('remember_me') == true) {
            Passport::personalAccessTokensExpireIn(now()->addMonth(1));
        }

//        $user = User::with('roles.permissions', 'permissions')
//            ->whereId(auth()->user()->id)
//            ->first();

        $user = $this->userRepository->findById(auth()->user()->id);
        $this->hydrateSuperAdminPermissions($user);

        return [
            'user' => $user,
            'token' => $this->createToken(auth()->user()),
            'token_type' => \App\Enums\Auth::TOKEN_TYPE
        ];
    }

    public function createUser($attributes)
    {
        $user = $this->userRepository->store($attributes);

        if (is_null($user)) {
            return null;
        }

        if (!Auth::attempt($attributes)) {
            return null;
        }

        return $this->createToken(auth()->user());
    }

    public function createToken($user)
    {
        return $user->createToken('API Token')->accessToken;
    }

    private function hydrateSuperAdminPermissions(User $user): void
    {
        if (!$user->hasRole('Super Admin')) {
            return;
        }

        $allPermissions = Permission::query()
            ->where('guard_name', 'web')
            ->orderBy('id')
            ->get();

        $user->roles->each(function ($role) use ($allPermissions) {
            if ($role->name === 'Super Admin') {
                $role->setRelation('permissions', $allPermissions);
            }
        });
    }

    public function logout(Request $request)
    {
        //dd($request->all());
        if ($request->has('user.id'))
        {
            $user = User::find($request->input('user.id'));
            $result = $user->tokens()->delete();

            if ($result === 1) {
                return [
                    'success' => true
                ];
            }
        }
        else if (auth()->user() != null)
        {
            $result = auth()->user()->tokens()->delete();

            if ($result == 1) {
                return [
                    'success' => true
                ];
            }
        }

        return [
            'success' => false
        ];
    }

    public function saveProfileData($request)
    {
//        $user = $this->userRepository->find(auth()->user()->id)->update($request->only(['first_name', 'last_name']));
        $user = $this->userRepository->find(auth()->user()->id);
        if ($request->has('first_name'))
        {
            $user->first_name = $request->first_name;
        }
        if ($request->has('last_name'))
        {
            $user->last_name = $request->last_name;
        }
        if ($request->has('password'))
        {
            $user->password = $request->password;
        }
        $result = $user->save();

        if ($result != 1) {
            return [
                'success' => false
            ];
        }

        return [
            'success' => true,
            'user' => $this->userRepository->findById(auth()->user()->id),
        ];
    }

    public function getCurrentUser()
    {
        $user = $this->userRepository->findById(auth()->user()->id);
        $this->hydrateSuperAdminPermissions($user);

        return $user;
    }
}
