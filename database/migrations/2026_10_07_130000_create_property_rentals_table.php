<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates the `property_rentals` table as a One-to-One normalized extension
     * of the `properties` table. Data here ONLY exists for listing_type = 'rent'.
     * This prevents "fat table" sparse nullables on the main properties table.
     */
    public function up(): void
    {
        Schema::create('property_rentals', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('property_id')
                ->unique()
                ->constrained('properties')
                ->cascadeOnDelete();

            // Pricing period: determines how the rent price is displayed (e.g. "Rp 5jt / bulan")
            $table->enum('rent_period', ['monthly', 'yearly'])->default('monthly');

            // Minimum lease duration — unit INHERITS from rent_period (no separate unit column)
            // e.g. rent_period='monthly', min_lease_duration=6 means "minimum 6 months"
            // e.g. rent_period='yearly',  min_lease_duration=2 means "minimum 2 years"
            $table->unsignedSmallInteger('min_lease_duration')->default(1);

            // Filled ONLY when a WON deal occurs via Buyer Pipeline
            // Used by "Lease Expiring Soon" widget on Overview Dashboard
            $table->date('lease_end_date')->nullable();

            // Filled ONLY when a WON deal occurs. Used EXCLUSIVELY to freeze DOM calculation.
            // DO NOT use updated_at for this — it changes on any subsequent edit.
            $table->timestamp('rented_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('property_rentals');
    }
};
