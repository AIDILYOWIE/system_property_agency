<?php

namespace App\Http\Requests\Client;

use Illuminate\Foundation\Http\FormRequest;

class UpdateClientRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('phone')) {
            $phone = preg_replace('/[^0-9]/', '', $this->input('phone'));
            if (str_starts_with($phone, '08')) {
                $phone = '628' . substr($phone, 2);
            } elseif (str_starts_with($phone, '8')) {
                $phone = '628' . substr($phone, 1);
            }
            $this->merge([
                'phone' => $phone,
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $clientId = $this->route('id');

        return [
            'fullName' => 'required|string|max:255',
            'phone' => 'required|string|max:50|unique:customers,phone,' . $clientId,
            'email' => 'nullable|email|max:255',
            'source' => 'required|string',
            'note' => 'nullable|string',
            'property_ids' => 'required|array|min:1',
            'property_ids.*' => 'required|uuid|exists:properties,id',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'phone.unique' => 'Nomor WhatsApp ini sudah digunakan customer lain',
        ];
    }
}
