<?php

namespace App\Http\Requests\Contract;

use App\Logic\FileTypes;
use App\Rules\FileType;
use App\Rules\ResponsiblePersonExists;
use Illuminate\Foundation\Http\FormRequest;

class ContractUpdateRequest extends FormRequest
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
            'status' => ['sometimes', 'required'],
//            'name' => ['sometimes', 'required', 'unique:contracts,name'],
            'name' => ['sometimes', 'required'],
            'contract_type_id' => ['sometimes', 'required', 'numeric', 'exists:contract_types,id'],
            'supplier_id' => ['sometimes', 'nullable', 'numeric', 'exists:suppliers,id'],
            'name_of_contractor' => ['sometimes'],
            'address' => ['sometimes', 'required'],
            'company_id' => ['sometimes', 'required', 'numeric', 'exists:companies,id'],
            'deadline_from' => ['sometimes', 'required'],
            'deadline_to' => ['sometimes', 'required'],
            'responsible_person' => ['sometimes', 'required', 'numeric', new ResponsiblePersonExists],
            // 'total_price' => ['sometimes', 'required', 'integer', 'digits_between:1,1000000', 'not_in:0'],
            // 'unit_price' => ['sometimes', 'required', 'integer', 'digits_between:1,1000000', 'not_in:0'],
            // 'payment_date' => ['sometimes', 'required'],
            // 'payment_terms' => ['sometimes', 'required', 'max:1000'],
            // 'contractor_obligations' => ['sometimes', 'string', 'max:1000'],
            // 'company_obligations' => ['sometimes', 'string', 'max:1000'],
            'department_id' => ['sometimes', 'required', 'numeric', 'exists:departments,id'],
            'comment' => ['sometimes', 'required', 'string'],
//            'files' => ['sometimes', 'required', $this->file('files') != null ? new FileType($this->file('files')) : ''],
            'files.*' => ['sometimes', 'required', 'mimes:'.implode(',', FileTypes::getAllowedFileTypes()), 'max:25000'],
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
            'total_price.digits_between' => 'The total price should not be a negative value or 0.',
            'total_price.not_in' => 'The total price should not be a negative value or 0.',
            'unit_price.digits_between' => 'The total price should not be a negative value or 0.',
            'unit_price.not_in' => 'The total price should not be a negative value or 0.',
        ];
    }
}
