<?php

use App\Http\Controllers\ClientController;
use App\Http\Controllers\NewLeadController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\FacilityController;
use App\Http\Controllers\BuyerPipelineController;
use App\Http\Controllers\DossierController;
use App\Http\Controllers\PublicLeadController;
use App\Http\Controllers\SellerController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/', function () {
    return Inertia::render('Dashboard');
})->name('dashboard');

Route::prefix('/inventory')->group(function () {
    Route::post('/', [PropertyController::class, 'store'])->name('inventory.store');

    Route::get('/', [PropertyController::class, 'index'])->name('inventory');

    Route::patch('/{id}/visibility', [PropertyController::class, 'toggleVisibility'])->name('inventory.visibility');

    Route::get('/detail/{id}', [PropertyController::class, 'show'])->name('inventory.detail');

    Route::get('/add', [PropertyController::class, 'create'])->name('inventory.add');


    Route::get('/edit/{id}', [PropertyController::class, 'edit'])->name('inventory.edit');
    Route::patch('/{id}', [PropertyController::class, 'update'])->name('inventory.update');
});

Route::prefix('/customer')->group(function () {
    Route::get('/', [ClientController::class, 'index'])->name('customer');
    Route::post('/', [ClientController::class, 'store'])->name('customer.store');
    Route::get('/add', [ClientController::class, 'create'])->name('customer.add');
    Route::get('/detail/{id}', [ClientController::class, 'show'])->name('customer.detail');
    Route::post('/detail/{id}/follow-up', [ClientController::class, 'followUp'])->name('customer.follow-up');
    Route::patch('/detail/{id}/notes', [ClientController::class, 'updateNotes'])->name('customer.update-notes');
    Route::get('/edit/{id}', [ClientController::class, 'edit'])->name('customer.edit');
    Route::put('/{id}', [ClientController::class, 'update'])->name('customer.update');
});


Route::get('/buyer-pipeline', [BuyerPipelineController::class, 'index'])->name('buyer-pipeline');
Route::patch('/buyer-pipeline/{id}/status', [BuyerPipelineController::class, 'updateStatus'])->name('buyer-pipeline.status');

// Seller Pipeline
Route::prefix('/seller')->group(function () {
    Route::get('/', [SellerController::class, 'index'])->name('seller.index');
    Route::get('/add', [SellerController::class, 'create'])->name('seller.create');
    Route::post('/', [SellerController::class, 'store'])->name('seller.store');
    Route::get('/{seller}', [SellerController::class, 'show'])->name('seller.show');
    Route::post('/{seller}/property', [SellerController::class, 'storeProperty'])->name('seller.property.store');
});

Route::prefix('/settings')->group(function () {
    Route::get('/', [FacilityController::class, 'index'])->name('settings.index');
    Route::post('/facilities', [FacilityController::class, 'store'])->name('settings.facilities.store');
    Route::put('/facilities/{id}', [FacilityController::class, 'update'])->name('settings.facilities.update');
    Route::delete('/facilities/{id}', [FacilityController::class, 'destroy'])->name('settings.facilities.destroy');
});

// ── Dossier (Public — no auth) ─────────────────────────────────────────
Route::get('/dossier/{token}', [DossierController::class, 'show'])->name('dossier.show');


// ── Email Tracking & Redirect ──────────────────────────────────────────
Route::get('/api/follow-up/{inquiry}', [ClientController::class, 'trackEmailFollowUp'])->name('api.follow-up');

// ── Public API ─────────────────────────────────────────────────────────
Route::post('/api/leads', [PublicLeadController::class, 'store'])->name('api.leads.store');

Route::get('/new-lead', [NewLeadController::class, 'index'])->name('new-lead');



// Route::get('/inventory', function () {
//     return Inertia::render('Inventory/Inventory');
// })->name('inventory');

// Route::get('/add', function () {
//     return Inertia::render('Inventory/AddInventory');
// })->name('inventory.add');

// Route::get('/detail', function () {
//     return Inertia::render('Inventory/DetailInventory');
// })->name('inventory.detail');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
