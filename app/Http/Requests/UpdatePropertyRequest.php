<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePropertyRequest extends FormRequest
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
        $propertyId = $this->route('id');

        return [
            'title' => 'required|string|max:255|unique:properties,title,' . $propertyId,
            'description' => 'required|string',
            'location_area' => 'required|string|max:2000',
            'listing_type' => 'required|in:sale,rent',
            'category' => 'required|string|max:100',
            'price' => 'required|numeric|min:0',
            'currency' => 'required|in:IDR,USD',
            'land_size_sqm' => 'required|numeric|min:0',
            'building_size_sqm' => 'required|numeric|min:0',
            'bedrooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|integer|min:0',
            'tenure_type' => 'nullable|string|in:freehold,leasehold',
            'leasehold_years' => 'nullable|required_if:tenure_type,leasehold|integer|min:1',
            'projected_roi' => 'nullable|numeric|min:0|max:100',
            'zoning' => 'nullable|string',
            'main_thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120', // 5MB max
            'gallery' => 'nullable|array',
            'gallery.*' => 'image|mimes:jpeg,png,jpg,webp|max:5120',
            'deleted_images' => 'nullable|array',
            'deleted_images.*' => 'string',
            'marketing_start_date' => 'required|date',
            'social_media_1' => 'nullable|url|max:255',
            'social_media_2' => 'nullable|url|max:255',
        ];
    }
}
