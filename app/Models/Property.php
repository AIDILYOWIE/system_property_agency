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
        'published_at'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'projected_roi' => 'decimal:2',
        'published_at' => 'datetime',
        'land_size_sqm' => 'integer',
        'building_size_sqm' => 'integer',
        'bedrooms' => 'integer',
        'bathrooms' => 'integer',
        'leasehold_years' => 'integer'
    ];

    public function images(): HasMany
    {
        return $this->hasMany(PropertyImage::class)->orderBy('sort_order', 'asc');
    }

    public function mainImage()
    {
        return $this->hasOne(PropertyImage::class)->where('is_main_thumbnail', true);
    }
}
