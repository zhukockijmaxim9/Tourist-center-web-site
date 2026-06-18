<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddLeadNoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        $lead = $this->route('lead');
        $user = $this->user();

        if (!$user || !$lead) {
            return false;
        }

        if ($user->isAdmin()) {
            return true;
        }

        return $user->isManager() && (int) $lead->assigned_to_user_id === (int) $user->id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'note' => 'required|string',
        ];
    }
    
    public function messages(): array
    {
        return [
            'note.required' => 'Текст заметки обязателен',
        ];
    }
}
