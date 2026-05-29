<?php

namespace App\Http\Requests\Procurement;

use Illuminate\Foundation\Http\FormRequest;

class ProcurementUpdateRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'title'            => 'sometimes|required|string|max:255',
            'description'      => 'nullable|string',
            'justification'    => 'nullable|string',
            'procurement_type' => 'sometimes|required|in:goods,services,works',
            'estimated_value'  => 'nullable|numeric|min:0',
            'department_id'    => 'sometimes|required|exists:departments,id',
            'needed_by'        => 'nullable|date',
            'notes'            => 'nullable|string',
        ];
    }
}
