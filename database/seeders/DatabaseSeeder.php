<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(LeadStatusSeeder::class);

        User::updateOrCreate(
            ['email' => 'admin@tourist.com'],
            [
                'name' => 'Администратор',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'status' => 'active',
            ]
        );

        User::updateOrCreate(
            ['email' => 'manager@tourist.com'],
            [
                'name' => 'Менеджер',
                'password' => Hash::make('password'),
                'role' => 'manager',
                'status' => 'active',
            ]
        );

        User::updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'),
                'role' => 'user',
                'status' => 'active',
            ]
        );

        $this->call(DemoDataSeeder::class);
    }
}
