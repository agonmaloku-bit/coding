<?php

namespace App\Http\Requests\Permission;

use Illuminate\Validation\Rules;
use Illuminate\Foundation\Http\FormRequest;

class PermissionUpdateRequest extends FormRequest
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
        $id = $this->route('permission');
        return [
            'name'    => ['required', 'string', 'max:255', 'unique:permissions,name,' . $id],
            'comment' => ['nullable', 'string', 'max:1000'],
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
            'name.unique' => 'This permission has already been created, choose a different name.',
        ];
    }
}
