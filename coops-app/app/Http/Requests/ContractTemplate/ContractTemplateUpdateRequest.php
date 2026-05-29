<?php

namespace App\Http\Requests\ContractTemplate;

use Illuminate\Foundation\Http\FormRequest;

class ContractTemplateUpdateRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'name' => 'sometimes|required|string|max:255',
            'contract_type_id' => 'sometimes|required|numeric|exists:contract_types,id',
            'content' => 'sometimes|nullable|string',
            'file' => 'sometimes|nullable|file|mimes:doc,docx,txt,rtf,odt|max:10240',
        ];
    }
}
