<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    use HasUuids;

    protected $table = 'customers';

    protected $fillable = [
        'full_name',
        'phone',
        'email',
        'source',
        'notes',
        'extra_data',
        'last_active_at',
        'utm_medium',
        'referrer',
    ];

    protected $casts = [
        'extra_data' => 'array',
        'last_active_at' => 'datetime',
    ];

    public function inquiries(): HasMany
    {
        return $this->hasMany(Inquiry::class, 'customer_id');
    }
}
