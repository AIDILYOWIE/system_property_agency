<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Property extends Model
{
    use HasUuids;

    protected $fillable = [
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

        if (in_array($this->status, ['sold', 'rented']) && $this->sold_at) {
            $days = (int) $this->marketing_start_date->diffInDays($this->sold_at);
            return max(0, $days);
        }

        $days = (int) $this->marketing_start_date->diffInDays(now());
        // If start date is in the future, it could be negative, make it 0 at minimum
        return max(0, $days);
    }

    protected $appends = ['days_on_market'];
}
