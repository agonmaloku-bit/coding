<?php

namespace App\Http\Requests\Contract;

use App\Logic\FileTypes;
use App\Rules\FileType;
use App\Rules\ResponsiblePersonExists;
use Illuminate\Foundation\Http\FormRequest;

class ContractStoreRequest extends FormRequest
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
//            'name' => 'required|unique:contracts,name',
            'name' => ['required', 'string', 'max:255'],
            'contract_type_id' => ['required', 'numeric', 'exists:contract_types,id'],
            'supplier_id' => ['sometimes', 'nullable', 'numeric', 'exists:suppliers,id'],
            'name_of_contractor' => ['sometimes', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:255'],
            'company_id' => ['required', 'numeric', 'exists:companies,id'],
            'deadline_from' => ['required', 'max:255'],
            'deadline_to' => ['sometimes', 'required', 'max:255'],
            'responsible_person' => ['required', 'numeric', new ResponsiblePersonExists],
            // 'total_price' => ['required', 'integer', 'digits_between:1,1000000', 'not_in:0'],
            // 'unit_price' => ['required', 'integer', 'digits_between:1,1000000', 'not_in:0'],
            // 'payment_date' => ['required', 'max:255'],
            // 'payment_terms' => ['required', 'string', 'max:1000'],
            // 'contractor_obligations' => ['string', 'max:1000'],
            // 'company_obligations' => ['string', 'max:1000'],
            'department_id' => ['required', 'numeric', 'exists:departments,id'],
            'comment' => ['sometimes', 'required', 'string', 'max:255'],
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
