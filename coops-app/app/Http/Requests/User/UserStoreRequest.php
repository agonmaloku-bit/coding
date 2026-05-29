<?php

namespace App\Http\Requests\User;

use Illuminate\Validation\Rules\Password;
use Illuminate\Foundation\Http\FormRequest;

class UserStoreRequest extends FormRequest
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
            'first_name' => ['required', 'string', 'min:3', 'max:255'],
            'last_name' => ['required', 'string', 'min:3', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', Password::min(8)->letters()->mixedCase()->numbers(), 'max:255'],
            'password_confirmation' => ['required', 'same:password', Password::min(8)->letters()->mixedCase()->numbers(), 'max:255'],
            'company_id' => ['required', 'exists:companies,id', 'max:255'],
            'department_id' => ['required', 'exists:departments,id', 'max:255'],
            'roles' => ['required'],
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array
     */
    public function messages()
    {
        return [
            'department_id.required' => 'The department is required.',
            'roles.required' => 'Role is required.',
            'password_confirmation.same' => 'The password confirmation does not match.'
        ];
    }
}
