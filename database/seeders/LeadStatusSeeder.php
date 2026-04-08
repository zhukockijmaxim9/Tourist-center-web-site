<?php

namespace Database\Seeders;

use App\Models\LeadStatus;
use Illuminate\Database\Seeder;

class LeadStatusSeeder extends Seeder
{
    public function run(): void
    {
        $statuses = [
            ['name' => 'new',         'label' => 'Новая',     'color' => '#6c757d', 'sort_order' => 1, 'is_final' => false],
            ['name' => 'in_progress', 'label' => 'В работе',  'color' => '#0d6efd', 'sort_order' => 2, 'is_final' => false],
            ['name' => 'done',        'label' => 'Завершена', 'color' => '#198754', 'sort_order' => 3, 'is_final' => true],
            ['name' => 'cancelled',   'label' => 'Отменена',  'color' => '#dc3545', 'sort_order' => 4, 'is_final' => true],
        ];

        foreach ($statuses as $status) {
            LeadStatus::updateOrCreate(['name' => $status['name']], $status);
        }
    }
}
