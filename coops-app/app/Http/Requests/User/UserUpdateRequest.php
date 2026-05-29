<?php

namespace App\Http\Requests\User;

use Illuminate\Validation\Rules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserUpdateRequest extends FormRequest
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
            'first_name' => ['sometimes', 'required', 'string', 'min:3', 'max:255'],
            'last_name' => ['sometimes', 'required', 'string', 'min:3', 'max:255'],
            'email' => ['sometimes', 'required', 'string', Rule::unique('users', 'email')->ignore($this->route('user')), 'email', 'max:255'],
            'password' => ['sometimes', 'required', Password::min(8)->letters()->mixedCase()->numbers(), 'max:255'],
            'password_confirmation' => ['sometimes', 'required', 'same:password', 'max:255'],
            'department_id' => ['sometimes', 'required', 'exists:departments,id'],
            'roles' => ['required'],
        ];
    }

    /**
     * Prepare the data for validation.
     *
     * @return void
     */
    protected function prepareForValidation()
    {
        //
    }

    /**
     * Handle a passed validation attempt.
     *
     * @return void
     */
    protected function passedValidation()
    {
//        $data = $this->validated();

    }
}
