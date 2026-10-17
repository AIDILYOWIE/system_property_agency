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
        'status_reason',
        'closed_at',
    ];

    protected $casts = [
        'closed_at' => 'datetime',
    ];

    /** True when the inquiry has been finalized (WON or LOST). */
    public function getIsClosedAttribute(): bool
    {
        return in_array($this->pipeline_status, ['won', 'lost']);
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'customer_id');
    }
}
