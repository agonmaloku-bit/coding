<?php

namespace App\Http\Requests\Permission;

use Illuminate\Validation\Rules;
use Illuminate\Foundation\Http\FormRequest;

class PermissionStoreRequest extends FormRequest
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
            'name'    => ['required', 'string', 'max:255', 'unique:permissions,name'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ];
    }

    protected function passedValidation()
    {
        //$this->replace(['name' => $this->module['slug'] . "_" . $this->name['slug']]);
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
