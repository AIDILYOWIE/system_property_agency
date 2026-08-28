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
        Schema::create('customer_activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('customer_id')->constrained('customers')->onDelete('cascade');
            $table->foreignId('inquiry_id')->nullable()->constrained('inquiries')->onDelete('cascade');
            $table->string('action_type');
            $table->text('description')->nullable();
            $table->jsonb('old_values')->nullable();
            $table->jsonb('new_values')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_activity_logs');
    }
};
