<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class ProfilePostRequest extends FormRequest
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
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|unique:users,email|max:255',
//            'password' => 'sometimes|required|string|min:8|max:255',
//            'password_confirmation' => 'sometimes|required|string|min:8|same:password|max:255',
            'password' => ['sometimes', 'required', Password::min(8)->letters()->mixedCase()->numbers(), 'max:255'],
            'password_confirmation' => ['sometimes', 'required', 'same:password', 'max:255'],
        ];
    }
}
