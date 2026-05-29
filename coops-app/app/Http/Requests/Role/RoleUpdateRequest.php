<?php

namespace App\Http\Requests\Role;

use Illuminate\Validation\Rules;
use Illuminate\Foundation\Http\FormRequest;
use phpDocumentor\Reflection\Types\AbstractList;

class RoleUpdateRequest extends FormRequest
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
        $rules = [
            'name' => ['sometimes', 'required', 'unique:roles,name', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:255'],
        ];


        $role = \App\Models\Role::find($this->id);
        if ($this->name != $role->name) {
            $rules['name'] = ['required', 'unique:roles,name', 'string', 'max:255'];
        }
        else
        {
            $rules['name'] = ['required', 'string', 'max:255'];
        }
        return $rules;
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
