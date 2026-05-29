<?php

namespace App\Http\Requests\AppModule;

use Illuminate\Foundation\Http\FormRequest;

class BusinessAppIndexRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'only_active' => 'nullable|boolean',
        ];
    }
}
