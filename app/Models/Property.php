<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Property extends Model
{
    use HasUuids;

    protected $fillable = [
        'seller_id',
        'seller_pipeline_status',
        'seller_reason',
        'title',
        'description',
        'location_area',
        'full_address',
        'listing_type',
        'category',
        'price',
        'currency',
        'land_size_sqm',
        'building_size_sqm',
        'bedrooms',
        'bathrooms',
        'tenure_type',
        'leasehold_years',
        'projected_roi',
        'status',
        'visibility',
        'dossier_token',
        'published_at',
        'marketing_start_date',
        'social_media_1',
        'social_media_2',
        'sold_at'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'projected_roi' => 'decimal:2',
        'published_at' => 'datetime',
        'land_size_sqm' => 'integer',
        'building_size_sqm' => 'integer',
        'bedrooms' => 'integer',
        'bathrooms' => 'integer',
        'leasehold_years' => 'integer',
        'marketing_start_date' => 'date',
        'sold_at' => 'datetime'
    ];

    public function rentalDetail(): HasOne
    {
        return $this->hasOne(PropertyRental::class);
    }

    public function seller()
    {
        return $this->belongsTo(Seller::class, 'seller_id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(PropertyImage::class)->orderBy('sort_order', 'asc');
    }

    public function mainImage()
    {
        return $this->hasOne(PropertyImage::class)->where('is_main_thumbnail', true);
    }

    public function inquiries(): HasMany
    {
        return $this->hasMany(Inquiry::class);
    }

    public function facilities()
    {
        return $this->belongsToMany(Facility::class, 'property_facility');
    }

    public function getDaysOnMarketAttribute(): int
    {
        if (!$this->marketing_start_date) {
            return 0;
        }

        // Freeze DOM for sold properties using sold_at
        if ($this->status === 'sold' && $this->sold_at) {
            return (int) max(0, $this->marketing_start_date->diffInDays($this->sold_at));
        }

        // Freeze DOM for rented properties using rented_at from the rental relation
        // This ensures edits to the property after renting don't corrupt DOM history.
        if ($this->status === 'rented' && $this->rentalDetail && $this->rentalDetail->rented_at) {
            return (int) max(0, $this->marketing_start_date->diffInDays($this->rentalDetail->rented_at));
        }

        $days = (int) $this->marketing_start_date->diffInDays(now());
        return max(0, $days);
    }

    protected $appends = ['days_on_market'];
}
