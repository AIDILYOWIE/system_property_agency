<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inquiry extends Model
{
    protected $fillable = [
        'customer_id',
        'property_id',
        'pipeline_status',
        'lost_reason',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }
}
