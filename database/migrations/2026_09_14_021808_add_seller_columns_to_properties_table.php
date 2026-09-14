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
        Schema::table('properties', function (Blueprint $table) {
            $table->uuid('seller_id')->nullable()->after('id');
            $table->foreign('seller_id')->references('id')->on('sellers')->nullOnDelete();

            $table->enum('seller_pipeline_status', ['incoming', 'surveyed', 'agreed', 'listed', 'rejected'])
                ->nullable()
                ->after('status');

            $table->string('seller_rejection_reason')->nullable()->after('seller_pipeline_status');

            // Make price and location_area nullable for pra-listing stage
            $table->decimal('price', 15, 2)->nullable()->change();
            $table->string('location_area')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropForeign(['seller_id']);
            $table->dropColumn(['seller_id', 'seller_pipeline_status', 'seller_rejection_reason']);

            $table->decimal('price', 15, 2)->nullable(false)->change();
            $table->string('location_area')->nullable(false)->change();
        });
    }
};
