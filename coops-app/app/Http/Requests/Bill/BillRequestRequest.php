<?php

namespace App\Http\Requests\Bill;

use App\Logic\FileTypes;
use App\Rules\FileType;
use App\Rules\ResponsiblePersonExists;
use Illuminate\Foundation\Http\FormRequest;

class BillRequestRequest extends FormRequest
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
            'status' => 'sometimes|required',
            'step' => 'sometimes|required|numeric',
            // 'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'max:255'],
            'comment' => ['sometimes', 'required', 'string', 'max:255'],
            'files.*' => ['sometimes', 'required', 'mimes:' . implode(',', FileTypes::getAllowedFileTypes()), 'max:25000'],
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
            // 'name.unique' => 'The name has already been taken, choose a different name.',
            'value.digits_between' => 'The total price should not be a negative value or 0.',
            'value.not_in' => 'The total price should not be a negative value or 0.',
        ];
    }

/**
 * Prepare the data for validation.
 *
 * @return void
 */
/*protected function prepareForValidation()
{
if ($this->type == Status::ARCHIVED) {
$this->merge([
'status' => Status::ARCHIVED,
]);
}
if ($this->type == Status::REQUEST) {
$this->merge([
'status' => Status::ARCHIVED,
]);
}
}*/
}
