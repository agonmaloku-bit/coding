<?php

namespace App\Http\Requests\Company;

use Illuminate\Foundation\Http\FormRequest;

class CompanyUpdateRequest extends FormRequest
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
            "name" => "sometimes|required|unique:companies,name|max:255",
            "business_no" => "nullable|string|max:255",
            "address" => "nullable|string|max:255",
            "logo" => "nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048"
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
            'name.unique' => 'The name has already been taken, choose a different name.',
        ];
    }
}
