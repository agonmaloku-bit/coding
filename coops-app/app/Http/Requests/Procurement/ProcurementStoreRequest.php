<?php

namespace App\Http\Requests\Procurement;

use Illuminate\Foundation\Http\FormRequest;

class ProcurementStoreRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'title'            => 'required|string|max:255',
            'description'      => 'nullable|string',
            'justification'    => 'nullable|string',
            'procurement_type' => 'required|in:goods,services,works',
            'estimated_value'  => 'nullable|numeric|min:0',
            'department_id'    => 'required|exists:departments,id',
            'needed_by'        => 'nullable|date',
            'notes'            => 'nullable|string',
        ];
    }
}
