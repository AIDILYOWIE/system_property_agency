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
            $table->string('title');
            $table->string('location_area');
            $table->text('description')->nullable();
            $table->enum('listing_type', ['Sale', 'Rent']);
            $table->string('category');
            $table->string('partnership_type');
            $table->decimal('price', 15, 2);
            $table->string('currency', 3);
            $table->integer('land_size')->nullable();
            $table->integer('building_size')->nullable();
            $table->integer('bedrooms')->nullable();
            $table->integer('bathrooms')->nullable();
            $table->string('tenure_type')->nullable();
            $table->integer('leasehold_years')->nullable();
            $table->decimal('projected_roi', 5, 2)->nullable();
            $table->string('status');
            $table->string('visibility');
            $table->timestamp('published_at')->nullable();
            $table->timestamp('open_slot_expiry_date')->nullable();
            $table->integer('remaining_days_paused')->nullable();
            $table->integer('total_leads_count')->default(0);
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
