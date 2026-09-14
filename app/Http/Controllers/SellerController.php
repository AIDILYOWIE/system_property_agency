<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Seller;
use App\Service\SellerService;

class SellerController extends Controller
{
    protected SellerService $sellerService;

    public function __construct(SellerService $sellerService)
    {
        $this->sellerService = $sellerService;
    }

    public function index()
    {
        $sellers = Seller::latest()->get();

        return Inertia::render('Seller/Seller', [
            'sellers' => $sellers
        ]);
    }

    public function create()
    {
        return Inertia::render('Seller/AddSeller');
    }

    public function store(\App\Http\Requests\SellerRequest $request)
    {
        // 1. HTTP Validation (Handled by SellerRequest)
        $validated = $request->validated();

        // 2. Delegate to Service Layer
        $seller = $this->sellerService->createSeller($validated);

        // 3. Output / Response
        return redirect()->route('seller.show', $seller->id)
            ->with('success', 'Seller berhasil ditambahkan. Tambahkan properti pertama?');
    }

    // Placeholder for US 4.3 (Seller Detail) so the redirect doesn't crash completely.
    public function show(Seller $seller)
    {
        return Inertia::render('Seller/DetailSeller', [
            'seller' => $seller
        ]);
    }
}
