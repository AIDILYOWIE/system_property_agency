<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Seller extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'phone',
        'email',
        'source',
        'notes',
    ];

    public function properties()
    {
        return $this->hasMany(Property::class, 'seller_id');
    }
}
