<?php

namespace App\Http\Requests\DirectorDepartment;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class DirectorDepartmentStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', Password::min(8)->letters()->mixedCase()->numbers(), 'max:255'],
            'password_confirmation' => ['required', 'same:password', 'max:255'],
            'department_id' => ['required', 'exists:departments,id', 'max:255'],
            'roles' => ['required'],
        ];
    }
}
