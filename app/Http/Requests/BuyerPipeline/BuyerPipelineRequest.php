<?php

namespace App\Http\Requests\BuyerPipeline;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class BuyerPipelineRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Set to true as standard authorization is handled elsewhere currently
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'status' => 'required|string|in:new_lead,contacted,viewing,negotiation,won,lost',
            'status_reason' => 'required_if:status,lost,won|string|max:1000|nullable'
        ];
    }
}
