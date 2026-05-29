<?php

namespace App\Rules;

use App\Enums\Roles;
use Illuminate\Contracts\Validation\Rule;

class ResponsiblePersonExists implements Rule
{
    /**
     * Create a new rule instance.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Determine if the validation rule passes.
     *
     * @param  string  $attribute
     * @param  mixed  $value
     * @return bool
     */
    public function passes($attribute, $value)
    {
        $user = \App\Models\User::find($value);
        if ($user && $user->hasRole([Roles::RESPONSIBLE_PERSON, Roles::DIRECTOR_DEPARTMENT]))
        {
            return true;
        }
        return false;
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message()
    {
        return 'This user is not the right user.';
    }
}
