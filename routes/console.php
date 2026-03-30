<?php

use Database\Seeders\DatabaseSeeder;
use Database\Seeders\DemoDataSeeder;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('app:seed-demo
    {--fresh : Recreate all tables before seeding demo data}
    {--users=25 : Number of demo users to create}
    {--leads=45 : Number of demo leads to create}
    {--reviews=10 : Number of demo reviews to create}
    {--categories=10 : Number of demo categories to create}
    {--services=25 : Number of demo services to create}', function () {
    $counts = [
        'users' => max(1, (int) $this->option('users')),
        'leads' => max(1, (int) $this->option('leads')),
        'reviews' => max(1, (int) $this->option('reviews')),
        'categories' => max(1, (int) $this->option('categories')),
        'services' => max(1, (int) $this->option('services')),
    ];

    if ($this->option('fresh')) {
        $this->call('migrate:fresh', ['--force' => true]);
    }

    config()->set('demo-seeder.users', $counts['users']);
    config()->set('demo-seeder.leads', $counts['leads']);
    config()->set('demo-seeder.reviews', $counts['reviews']);
    config()->set('demo-seeder.categories', $counts['categories']);
    config()->set('demo-seeder.services', $counts['services']);

    $this->call('db:seed', ['--class' => DatabaseSeeder::class, '--force' => true]);
    $this->call('db:seed', ['--class' => DemoDataSeeder::class, '--force' => true]);

    $this->components->info('The demo data has been successfully refreshed.');
})->purpose('Populate the database with demo CRM data for local development');
