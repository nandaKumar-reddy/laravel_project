<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateTicketRequest extends FormRequest
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
            'email' => 'required|email|max:1000',
            'category' => 'required|integer|exists:hesk_categories,id',
            'emp_cat' => 'nullable|string|max:250',
            'emp_sub_cat' => 'nullable|string|max:250',
            'emp_issue' => 'nullable|string|max:250',
            'priority' => 'required|in:0,1,2,3',
            'message' => 'required|string|max:2000',
            'owner' => 'nullable|integer|exists:hesk_users,id',
            'attachments.*' => 'nullable|file|max:10240|mimes:jpeg,png,jpg,gif,pdf,doc,docx,txt',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages()
    {
        return [
            'attachments.*.max' => 'Each file must not be greater than 10MB',
            'attachments.*.mimes' => 'Only jpeg, png, jpg, gif, pdf, doc, docx, and txt files are allowed',
        ];
    }
}
