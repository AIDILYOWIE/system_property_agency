<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title')->unique();
            $table->text('description')->nullable();
            $table->string('location_area');
            $table->enum('listing_type', ['sale', 'rent']);
            $table->string('category');
            $table->decimal('price', 15, 2);
            $table->enum('currency', ['IDR', 'USD'])->default('IDR');
            $table->integer('land_size_sqm')->nullable();
            $table->integer('building_size_sqm')->nullable();
            $table->integer('bedrooms')->nullable();
            $table->integer('bathrooms')->nullable();
            $table->string('tenure_type')->nullable(); // SHM, HGB, dll
            $table->integer('leasehold_years')->nullable();
            $table->decimal('projected_roi', 5, 2)->nullable();
            $table->enum('status', ['available', 'sold', 'rented'])->default('available');
            $table->enum('visibility', ['published', 'draft'])->default('draft');
            $table->uuid('dossier_token')->nullable()->unique();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
