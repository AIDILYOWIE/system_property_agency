<?php

namespace App\Models;

use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PropertyRental extends Model
{
    protected $fillable = [
        'property_id',
        'rent_period',
        'min_lease_duration',
        'lease_end_date',
        'rented_at',
    ];

    protected $casts = [
        'lease_end_date' => 'date',
        'rented_at'      => 'datetime',
        'min_lease_duration' => 'integer',
    ];

    /**
     * Relationship back to the parent property.
     */
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    /**
     * Accessor: calculate how many days remain until the lease ends.
     * Returns null if lease_end_date is not yet set (property not yet rented).
     * Returns negative if the lease has already expired.
     * Used by Overview Dashboard "Lease Expiring Soon" widget.
     */
    public function getDaysUntilLeaseEndsAttribute(): ?int
    {
        if (!$this->lease_end_date) {
            return null;
        }

        return (int) Carbon::today()->diffInDays($this->lease_end_date, false);
    }

    /**
     * Accessor: human-readable label of rent period.
     * Maps 'monthly' -> 'Bulan' and 'yearly' -> 'Tahun'.
     */
    public function getRentPeriodLabelAttribute(): string
    {
        return match ($this->rent_period) {
            'monthly' => 'Bulan',
            'yearly'  => 'Tahun',
            default   => ucfirst($this->rent_period),
        };
    }

    /**
     * Accessor: human-readable min lease duration including its derived unit.
     * e.g. rent_period='monthly', min_lease_duration=6 -> "6 Bulan"
     */
    public function getMinLeaseDurationLabelAttribute(): string
    {
        $unit = $this->rent_period === 'monthly' ? 'Bulan' : 'Tahun';
        return "{$this->min_lease_duration} {$unit}";
    }

    protected $appends = ['days_until_lease_ends', 'rent_period_label', 'min_lease_duration_label'];
}
