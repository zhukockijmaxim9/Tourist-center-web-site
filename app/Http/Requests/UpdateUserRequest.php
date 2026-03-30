<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
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
        // Accessing the user being updated from the route
        $userId = $this->route('user')->id;

        return [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $userId,
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:6',
            'role' => 'nullable|string|in:user,admin',
            'status' => 'nullable|string|in:active,inactive',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Имя пользователя обязательно для заполнения',
            'email.required' => 'Email обязателен для заполнения',
            'email.email' => 'Укажите корректный email адрес',
            'email.unique' => 'Пользователь с таким email уже существует',
            'password.min' => 'Пароль должен состоять минимум из 6 символов',
            'role.in' => 'Указана неверная роль пользователя',
            'status.in' => 'Указан неверный статус',
        ];
    }
}
