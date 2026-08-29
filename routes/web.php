<?php

use App\Http\Controllers\NewLeadController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PropertyController;
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

    Route::get('/detail/{id}', [PropertyController::class, 'show'])->name('inventory.detail');
    
    Route::get('/add', function () {
        return Inertia::render('Inventory/AddInventory');
    })->name('inventory.add');


    Route::get('/edit', function () {
        return Inertia::render('Inventory/EditInventory');
    })->name('inventory.edit');
});

Route::prefix('/customer')->group(function () {
    Route::get('/', function () {
        return Inertia::render('Customer/Customer');
    })->name('customer');

    Route::get('/add', function () {
        return Inertia::render('Customer/AddCustomer');
    })->name('customer.add');

    Route::get('/detail/{id}', function ($id) {
        return Inertia::render('Customer/DetailCustomer', ['id' => $id]);
    })->name('customer.detail');

    Route::get('/edit/{id}', function ($id) {
        return Inertia::render('Customer/EditCustomer', ['id' => $id]);
    })->name('customer.edit');
});

Route::get('/buyer-pipeline', function () {
    return Inertia::render('BuyerPipeline/BuyerPipeline');
})->name('buyer-pipeline');

// ── Dossier (Public — no auth) ─────────────────────────────────────────
Route::get('/dossier/preview', function () {
    return Inertia::render('Dossier/DossierPage');
})->name('dossier.preview');

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
