<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Service;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        // 1. Создаем категории
        $cat1 = Category::create([
            'name' => 'Экскурсии',
            'description' => 'Увлекательные прогулки по историческим местам'
        ]);

        $cat2 = Category::create([
            'name' => 'Проживание',
            'description' => 'Отели, хостелы и гостевые дома'
        ]);

        // 2. Создаем услуги и привязываем их
        Service::create([
            'name' => 'Обзорная экскурсия по городу',
            'description' => '3-часовая прогулка с гидом',
            'price' => 1500,
            'category_id' => $cat1->id,
            'status' => 'active'
        ]);

        Service::create([
            'name' => 'Отель "Центральный"',
            'description' => 'Уютный номер в самом центре',
            'price' => 5000,
            'category_id' => $cat2->id,
            'status' => 'active'
        ]);
    }
}
