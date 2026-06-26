<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\PoinPackage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin CerdikAI',
            'email' => 'admin@cerdik-ai.my.id',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'poin' => 999999,
        ]);

        PoinPackage::create(['name' => 'Starter', 'poin' => 50, 'price' => 25000]);
        PoinPackage::create(['name' => 'Populer', 'poin' => 150, 'price' => 65000]);
        PoinPackage::create(['name' => 'Pro', 'poin' => 400, 'price' => 150000]);
        PoinPackage::create(['name' => 'Unlimited', 'poin' => 1000, 'price' => 300000]);
    }
}
