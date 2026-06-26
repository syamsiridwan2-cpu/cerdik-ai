<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PoinPackage extends Model
{
    protected $fillable = [
        'name',
        'poin',
        'price',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'poin' => 'integer',
            'price' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}
