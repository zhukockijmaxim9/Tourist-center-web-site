<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLeadRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'message' => 'nullable|string',
            'service_id' => 'required|exists:services,id',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Введите ваше имя',
            'email.required' => 'Укажите адрес электронной почты',
            'email.email' => 'Введите корректный email адрес',
            'phone.required' => 'Введите номер телефона',
            'service_id.required' => 'Выберите интересующую вас услугу',
            'service_id.exists' => 'Выбранная услуга не найдена',
        ];
    }
}
