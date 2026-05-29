<?php

namespace App\Http\Requests\WorkflowTemplate;

use Illuminate\Foundation\Http\FormRequest;

class WorkflowTemplateStoreRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'name' => 'required|string|max:255',
            'type' => 'required|in:contract,bill',
            'company_id' => 'nullable|exists:companies,id',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
            'steps' => 'required|array|min:1',
            'steps.*.name' => 'required|string|max:255',
            'steps.*.role_id' => 'required|exists:roles,id',
            'steps.*.notify_roles' => 'nullable|array',
            'steps.*.notify_roles.*' => 'exists:roles,id',
            'steps.*.description' => 'nullable|string|max:500',
        ];
    }
}
