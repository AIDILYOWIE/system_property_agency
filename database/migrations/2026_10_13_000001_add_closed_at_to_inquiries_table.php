<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add `closed_at` to inquiries to support the Conversion Snapshot dashboard metric.
     *
     * Why NOT use `updated_at`:
     *   - `updated_at` changes on ANY update (e.g., adding a note, status_reason changes).
     *   - `closed_at` is set ONCE when pipeline_status transitions to `won` or `lost`,
     *     providing a reliable, immutable timestamp for the 30-day conversion window query.
     *
     * PRD Section 5, Metric 6: Conversion Snapshot — WON vs LOST ratio in the last 30 days.
     */
    public function up(): void
    {
        Schema::table('inquiries', function (Blueprint $table) {
            $table->timestamp('closed_at')
                ->nullable()
                ->after('status_reason')
                ->comment('Set once when pipeline_status becomes won or lost. Used by Conversion Snapshot metric.');
        });
    }

    public function down(): void
    {
        Schema::table('inquiries', function (Blueprint $table) {
            $table->dropColumn('closed_at');
        });
    }
};
