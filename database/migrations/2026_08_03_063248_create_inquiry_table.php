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
        Schema::create('inquiries', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('customer_id')->constrained('customers')->onDelete('cascade');
            $table->foreignUuid('property_id')->nullable()->constrained('properties')->onDelete('cascade');
            $table->enum('pipeline_status', ['new_lead', 'contacted', 'viewing', 'negotiation', 'won', 'lost'])->default('new_lead');
            $table->string('lost_reason')->nullable();
            $table->timestamps();

            $table->unique(['customer_id', 'property_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inquiries');
    }
};
