<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SellerPropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'           => 'required|string|max:255',
            'category'        => 'required|string|max:100',
            'listing_type'    => 'required|in:for_sale,for_rent',
            'price'           => 'nullable|numeric|min:0',
            'location_area'   => 'nullable|string|max:255',
            'notes'           => 'nullable|string',
        ];
    }
}
