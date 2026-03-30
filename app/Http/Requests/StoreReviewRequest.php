<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Admins are not allowed to leave reviews
        return !$this->user()->isAdmin();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'service_id' => 'required|exists:services,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'service_id.required' => 'Выберите услугу для отзыва',
            'service_id.exists' => 'Указанная услуга не найдена',
            'rating.required' => 'Пожалуйста, поставьте оценку',
            'rating.integer' => 'Оценка должна быть целым числом',
            'rating.min' => 'Минимальная оценка - 1',
            'rating.max' => 'Максимальная оценка - 5',
        ];
    }
}
