<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:50',
            'avatar_url' => 'nullable|string|max:200000',
            'avatar_style' => 'sometimes|integer|min:0|max:7',
        ];
    }
}
