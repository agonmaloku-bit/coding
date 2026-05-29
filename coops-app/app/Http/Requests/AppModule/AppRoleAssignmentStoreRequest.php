<?php

namespace App\Http\Requests\AppModule;

use Illuminate\Foundation\Http\FormRequest;

class AppRoleAssignmentStoreRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'business_app_id' => 'required|exists:business_apps,id',
            'user_id' => 'required|exists:users,id',
            'department_id' => 'nullable|exists:departments,id',
            'role_ids' => 'required|array|min:1',
            'role_ids.*' => 'required|exists:roles,id',
        ];
    }
}
