<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Lead;
use App\Models\LeadNote;
use App\Models\LeadStatus;
use App\Models\Review;
use App\Models\Service;
use App\Models\User;
use Faker\Factory as FakerFactory;
use Faker\Generator;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;

class DemoDataSeeder extends Seeder
{
    private const CORE_USER_EMAILS = [
        'admin@tourist.com',
        'test@example.com',
    ];

    private const CATEGORY_TEMPLATES = [
        ['name' => 'Экскурсии', 'description' => 'Обзорные, исторические и авторские маршруты для туристов.'],
        ['name' => 'Проживание', 'description' => 'Отели, апартаменты и гостевые дома для комфортного размещения.'],
        ['name' => 'Трансфер', 'description' => 'Индивидуальные и групповые поездки до туристических точек.'],
        ['name' => 'Активный отдых', 'description' => 'Походы, треккинг, водные и горные активности.'],
        ['name' => 'Семейный отдых', 'description' => 'Программы и сервисы для путешествий с детьми.'],
        ['name' => 'Гастротуры', 'description' => 'Дегустации, ужины и локальные гастрономические впечатления.'],
        ['name' => 'События', 'description' => 'Билеты и сопровождение на фестивали, концерты и праздники.'],
        ['name' => 'SPA и релакс', 'description' => 'Спа-программы, wellness и восстановительный отдых.'],
        ['name' => 'VIP-сервисы', 'description' => 'Персональный сервис, приоритетное обслуживание и премиальные маршруты.'],
        ['name' => 'Фото и медиа', 'description' => 'Фотосессии, видеосъёмка и контент-сопровождение поездок.'],
    ];

    private const SERVICE_ACTIVITIES = [
        'Пешеходная экскурсия',
        'Авторский тур',
        'Семейный маршрут',
        'Панорамная поездка',
        'Трансфер из аэропорта',
        'SPA-программа',
        'Ужин с дегустацией',
        'Фотопрогулка',
        'Уикенд-пакет',
        'Горный тур',
        'Речной круиз',
        'Исторический маршрут',
    ];

    private const DESTINATIONS = [
        'по старому городу',
        'к озёрному берегу',
        'по вечернему центру',
        'в винодельню',
        'в горный кластер',
        'по побережью',
        'для двоих',
        'для семьи',
        'с местным гидом',
        'на выходные',
        'с фото-сопровождением',
        'с дегустацией кухни',
    ];

    private const REVIEW_COMMENTS = [
        'Отличная организация, всё прошло вовремя и без накладок.',
        'Очень понравился маршрут и работа гида.',
        'Сервис оказался удобнее, чем ожидали, будем обращаться ещё.',
        'Хороший вариант для короткой поездки, впечатления остались приятные.',
        'Понравилось сопровождение и внимание к деталям.',
        'Услуга полностью оправдала стоимость, рекомендую.',
        'Быстро подтвердили бронь и подробно объяснили детали поездки.',
    ];

    public function run(): void
    {
        $faker = FakerFactory::create('ru_RU');

        $counts = [
            'categories' => max(1, (int) config('demo-seeder.categories', 10)),
            'services' => max(1, (int) config('demo-seeder.services', 25)),
            'users' => max(1, (int) config('demo-seeder.users', 25)),
            'leads' => max(1, (int) config('demo-seeder.leads', 45)),
            'reviews' => max(1, (int) config('demo-seeder.reviews', 10)),
        ];

        $this->clearExistingDemoData();

        $categories = $this->createCategories($counts['categories']);
        $services = $this->createServices($faker, $categories, $counts['services']);
        $users = $this->createUsers($faker, $counts['users']);

        $this->createLeads($faker, $users, $services, $counts['leads']);
        $this->createReviews($faker, $users, $services, $counts['reviews']);

        $this->command?->info(sprintf(
            'Demo data created: %d categories, %d services, %d users, %d leads, %d reviews.',
            $counts['categories'],
            $counts['services'],
            $counts['users'] + count(self::CORE_USER_EMAILS),
            $counts['leads'],
            $counts['reviews']
        ));
    }

    private function clearExistingDemoData(): void
    {
        LeadNote::query()->delete();
        Review::query()->delete();
        Lead::query()->delete();
        Service::query()->delete();
        Category::query()->delete();
        User::query()->whereNotIn('email', self::CORE_USER_EMAILS)->delete();
    }

    private function createCategories(int $count): Collection
    {
        $templates = collect(self::CATEGORY_TEMPLATES);

        return collect(range(1, $count))->map(function (int $index) use ($templates) {
            $template = $templates[($index - 1) % $templates->count()];
            $suffix = $index > $templates->count() ? ' ' . $index : '';

            return Category::create([
                'name' => $template['name'] . $suffix,
                'description' => $template['description'],
            ]);
        });
    }

    private function createServices(Generator $faker, Collection $categories, int $count): Collection
    {
        return collect(range(1, $count))->map(function (int $index) use ($faker, $categories, $count) {
            $activity = self::SERVICE_ACTIVITIES[($index - 1) % count(self::SERVICE_ACTIVITIES)];
            $destination = self::DESTINATIONS[($index - 1) % count(self::DESTINATIONS)];
            $name = sprintf('%s %s', $activity, $destination);

            return Service::create([
                'name' => $count > count(self::SERVICE_ACTIVITIES) * count(self::DESTINATIONS)
                    ? $name . ' #' . $index
                    : $name,
                'description' => self::buildServiceDescription($activity, $destination),
                'category_id' => $categories->random()->id,
                'price' => $faker->numberBetween(1800, 45000),
                'image' => self::resolveServiceCardImage($activity, $destination),
                'status' => $index % 5 === 0 ? 'inactive' : 'active',
            ]);
        });
    }

    private static function buildServiceDescription(string $activity, string $destination): string
    {
        $d = $destination;

        return match ($activity) {
            'Пешеходная экскурсия' => "Пеший маршрут {$d}: улочки, факты о квартале и темп без спешки.",
            'Авторский тур' => "Маршрут {$d} от ведущего: личные акценты, обход шумных мест и гибкий тайминг.",
            'Семейный маршрут' => "Спокойный формат {$d}: короткие отрезки пути, паузы и ориентир на детей.",
            'Панорамная поездка' => "Поездка {$d} с акцентом на виды из окна и остановками на смотровых точках.",
            'Трансфер из аэропорта' => "Встреча в зоне прилёта и довоз {$d}; помощь с багажем и посадкой.",
            'SPA-программа' => "Спа-ритуалы {$d}: подбор процедур при записи и время на отдых после блока.",
            'Ужин с дегустацией' => "Вечер {$d}: несколько подач, напитки к блюдам и комментарий шефа или сомелье.",
            'Фотопрогулка' => "Прогулка {$d} со съёмкой: ракурсы, свет и небольшая подборка кадров после съёмки.",
            'Уикенд-пакет' => "Сборка на два дня {$d}: ключевые активности, переезды и окно без плотного графика.",
            'Горный тур' => "Выезд {$d}: тропы средней сложности, сопровождение и упор на безопасность группы.",
            'Речной круиз' => "Прогулка по воде {$d}: маршрут по течению, комментарий и палубный сервис.",
            'Исторический маршрут' => "Хронология и памятные места {$d}: эпохи, события и ответы гида на вопросы.",
            default => "{$activity} {$d}. Старт, длительность и точка встречи согласуем после заявки.",
        };
    }

    private static function resolveServiceCardImage(string $activity, string $destination): string
    {
        $t = mb_strtolower($activity . ' ' . $destination, 'UTF-8');

        if (str_contains($t, 'спа') || str_contains($t, 'spa')) {
            return '/images/services/spa.png';
        }
        if (str_contains($t, 'ужин') || str_contains($t, 'дегустац')) {
            return '/images/services/gourmet.png';
        }
        if (str_contains($t, 'речной') || str_contains($t, 'круиз')) {
            return '/images/services/cruise.png';
        }
        if (str_contains($t, 'семейн') || str_contains($t, 'для семьи')) {
            return '/images/services/family.png';
        }
        if (str_contains($t, 'фотопрогул')) {
            return '/images/services/family.png';
        }
        if (str_contains($t, 'трансфер') || str_contains($t, 'аэропорт') || str_contains($t, 'вечернему центру')) {
            return '/images/services/city-night.png';
        }
        if (str_contains($t, 'горн')) {
            return '/images/services/lake.png';
        }
        if (str_contains($t, 'винодельн')) {
            return '/images/services/vineyard.png';
        }
        if (str_contains($t, 'озёрн') || str_contains($t, 'панорам') || str_contains($t, 'побережь')) {
            return '/images/services/lake.png';
        }
        if (str_contains($t, 'историческ')) {
            return '/images/services/heritage.png';
        }
        if (str_contains($t, 'пешеходн') || str_contains($t, 'старому городу')) {
            return '/images/services/heritage.png';
        }
        if (str_contains($t, 'авторск')) {
            return '/images/services/map-tour.png';
        }
        if (str_contains($t, 'уикенд') || str_contains($t, 'для двоих')) {
            return '/images/services/vineyard.png';
        }

        return '/images/services/map-tour.png';
    }

    private function createUsers(Generator $faker, int $count): Collection
    {
        return collect(range(1, $count))->map(function (int $index) use ($faker) {
            return User::create([
                'name' => $faker->name(),
                'email' => sprintf('demo.user%02d@example.com', $index),
                'phone' => $this->generatePhone($faker),
                'password' => 'password',
                'role' => 'user',
                'status' => $index % 6 === 0 ? 'inactive' : 'active',
            ]);
        });
    }

    private function createLeads(Generator $faker, Collection $users, Collection $services, int $count): void
    {
        $availableUsers = $users->concat(User::query()->where('email', 'test@example.com')->get())->values();
        $statusNames = ['new', 'new', 'new', 'in_progress', 'in_progress', 'done', 'cancelled'];
        $statusIds = LeadStatus::whereIn('name', array_unique($statusNames))
            ->pluck('id', 'name');

        foreach (range(1, $count) as $index) {
            $user = $faker->boolean(75) ? $availableUsers->random() : null;
            $statusName = $statusNames[array_rand($statusNames)];

            Lead::create([
                'name' => $user?->name ?? $faker->name(),
                'email' => $user?->email ?? ($faker->boolean(85) ? sprintf('lead%02d@example.com', $index) : null),
                'phone' => $user?->phone ?: $this->generatePhone($faker),
                'message' => $faker->boolean(90) ? $faker->realTextBetween(90, 180) : null,
                'service_id' => $services->random()->id,
                'user_id' => $user?->id,
                'lead_status_id' => $statusIds[$statusName] ?? null,
            ]);
        }
    }

    private function createReviews(Generator $faker, Collection $users, Collection $services, int $count): void
    {
        $reviewUsers = $users->where('status', 'active')->shuffle()->values();
        $reviewServices = $services->where('status', 'active')->shuffle()->values();
        $usedPairs = [];
        $ratings = [5, 5, 5, 4, 4, 4, 3];
        $maxUniquePairs = $reviewUsers->count() * $reviewServices->count();

        foreach (range(1, $count) as $index) {
            $user = $reviewUsers[($index - 1) % $reviewUsers->count()];
            $service = $reviewServices[($index - 1) % $reviewServices->count()];
            $pairKey = $user->id . ':' . $service->id;

            while ($maxUniquePairs > count($usedPairs) && isset($usedPairs[$pairKey])) {
                $service = $reviewServices->random();
                $pairKey = $user->id . ':' . $service->id;
            }

            $usedPairs[$pairKey] = true;

            Review::create([
                'user_id' => $user->id,
                'service_id' => $service->id,
                'rating' => $ratings[array_rand($ratings)],
                'comment' => self::REVIEW_COMMENTS[($index - 1) % count(self::REVIEW_COMMENTS)] . ' ' . $faker->sentence(6),
                'is_approved' => $index <= max(1, (int) floor($count * 0.8)),
            ]);
        }
    }

    private function generatePhone(Generator $faker): string
    {
        return $faker->unique()->numerify('+79#########');
    }
}