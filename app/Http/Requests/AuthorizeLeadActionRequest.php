<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AuthorizeLeadActionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $lead = $this->route('lead');
        $user = $this->user();

        if ($user->isAdmin()) {
            return true;
        }

        if ($lead && $user->isManager()) {
            return (int) $lead->assigned_to_user_id === (int) $user->id;
        }

        return $lead && (int) $lead->user_id === (int) $user->id;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [];
    }
}
