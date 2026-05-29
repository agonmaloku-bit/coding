<?php

namespace App\Http\Requests\DirectorDepartment;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class DirectorDepartmentUpdateRequest extends FormRequest
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
            'first_name' => ['sometimes', 'required', 'string', 'max:255'],
            'last_name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'string', 'unique:users,email', 'email', 'max:255'],
            'password' => ['sometimes', 'required', Password::min(8)->letters()->mixedCase()->numbers(), 'max:255'],
            'password_confirmation' => ['sometimes', 'required', 'same:password', 'max:255'],
            'department_id' => ['sometimes', 'required', 'exists:departments,id'],
            'roles' => ['required'],
        ];
    }

    /**
     * Handle a passed validation attempt.
     *
     * @return void
     */
    protected function passedValidation()
    {
        if (array_key_exists("new_email", $this->validated()))
        {
            $this->request->add(["email" => $this->new_email]);
        }
    }
}
