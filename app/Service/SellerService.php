<?php

namespace App\Service;

use App\Models\Seller;
use Illuminate\Validation\ValidationException;

class SellerService
{
    /**
     * Create a new seller with specific business logic.
     *
     * @param array $data
     * @return Seller
     * @throws ValidationException
     */
    public function createSeller(array $data): Seller
    {
        // 1. Auto-format phone: non-digit removal, replace 08 with 628
        $cleanPhone = preg_replace('/[^0-9]/', '', $data['phone'] ?? '');
        if (str_starts_with($cleanPhone, '08')) {
            $cleanPhone = '628' . substr($cleanPhone, 2);
        }

        // 2. Re-check uniqueness after formatting
        if (Seller::where('phone', $cleanPhone)->exists()) {
            throw ValidationException::withMessages([
                'phone' => 'Nomor ini sudah terdaftar.'
            ]);
        }

        $data['phone'] = $cleanPhone;

        // 3. Persist to mapping
        return Seller::create($data);
    }
}
