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

        // If admin — allow, otherwise check if same user
        return $user->isAdmin() || ($lead && $lead->user_id === $user->id);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [];
    }
}
