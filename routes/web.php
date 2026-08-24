<?php

use App\Http\Controllers\ProfileController;
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

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->name('dashboard');

Route::prefix('/inventory')->group(function () {
    Route::get('/', function () {
        return Inertia::render('Inventory/Inventory');
    })->name('inventory');

    Route::get('/add', function () {
        return Inertia::render('Inventory/AddInventory');
    })->name('inventory.add');

    Route::get('/detail', function () {
        return Inertia::render('Inventory/DetailInventory');
    })->name('inventory.detail');

    Route::get('/edit', function () {
        return Inertia::render('Inventory/EditInventory');
    })->name('inventory.edit');
});

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
