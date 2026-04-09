<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLeadRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $lead = $this->route('lead');
        $user = $this->user();

        return $user->isAdmin() || ($lead && $lead->user_id === $user->id);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|max:255',
            'phone' => 'sometimes|required|string|max:20',
            'message' => 'nullable|string',
            'service_id' => 'sometimes|required|exists:services,id',
            'lead_status_id' => 'nullable|exists:lead_statuses,id',
            'status' => 'nullable|string|in:new,in_progress,confirmed,done,cancelled',
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
            'lead_status_id.exists' => 'Указан неверный статус заявки',
            'status.in' => 'Указан неверный статус заявки',
        ];
    }
}
