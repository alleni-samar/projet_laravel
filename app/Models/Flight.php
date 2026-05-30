<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'flight_number',
    'departure_city',
    'arrival_city',
    'departure_time',
    'arrival_time',
    'available_seats',
    'total_seats',
    'price'
])]
class Flight extends Model
{
    use HasFactory;

    /**
     * Get the reservations for the flight.
     */
    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'departure_time' => 'datetime',
            'arrival_time' => 'datetime',
            'price' => 'decimal:2',
            'available_seats' => 'integer',
            'total_seats' => 'integer',
        ];
    }
}
