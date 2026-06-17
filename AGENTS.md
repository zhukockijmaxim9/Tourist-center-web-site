# Tourist Center CRM (ELVA)

Система управления туристическим центром (CRM) на базе Laravel 11 и React 19 с Inertia.js. Проект представляет собой полноценное веб-приложение для управления заявками клиентов, услугами, пользователями и отзывами с ролевой моделью доступа (гость, пользователь, менеджер, администратор).

## Technology Stack

- **Backend**: Laravel 11.31+ (PHP ^8.2)
- **Frontend**: React 19.2.4, Inertia.js React ^3.0.3, Vite 6.0.11
- **Styling**: SCSS (Sass Embedded 1.98.0) с CSS custom properties, Glassmorphism UI, темная/светлая тема
- **Database**: PostgreSQL (по умолчанию), SQLite для локальной разработки
- **HTTP Client**: Axios ^1.7.4
- **Authentication**: Laravel session-based auth (кастомный AuthController, без Sanctum/Jetstream)
- **Testing**: PHPUnit ^11.0.1
- **Code Style**: Laravel Pint ^1.13
- **Dev Environment**: Laravel Sail (Docker), concurrently для параллельного запуска

## Project Structure

```
app/
├── Http/
│   ├── Controllers/          # 8 контроллеров (Auth, Category, Lead, Profile, Review, Service, User)
│   ├── Middleware/           # AdminMiddleware, StaffMiddleware, HandleInertiaRequests
│   └── Requests/             # 11 FormRequest-классов для валидации
├── Models/                   # 7 Eloquent-моделей (User, Service, Category, Lead, LeadStatus, LeadNote, Review)
└── Providers/                # AppServiceProvider (минимальный)

routes/
├── web.php                   # Inertia-страницы + группировка API-роутов под префиксом /api
├── auth.php                  # Auth API (login, register, logout, user, profile)
├── api_v1.php                # Публичные и аутентифицированные API-роуты
├── admin.php                 # Admin-only и staff роуты (CRUD, workflow заявок)
└── console.php               # Artisan-команды (app:seed-demo)

resources/
├── js/                       # React SPA
│   ├── app.jsx               # Точка входа с Inertia + контекст-провайдеры
│   ├── BaseApp.jsx           # Layout-обертка (Navbar + основной контент)
│   ├── api.js                # Централизованный Axios-клиент + endpoint-определения
│   ├── components/           # Переиспользуемые UI (DataTable, Modal, Navbar, ErrorBoundary)
│   ├── context/              # React Contexts (Auth, Theme, Notify/Toast)
│   ├── constants/            # Статические константы (roles, lead statuses)
│   ├── features/             # Feature-based модули
│   │   ├── admin/            # Табы админ-панели (Users, Services, Categories, Leads, Reviews)
│   │   ├── leads/            # Компоненты и хуки workflow заявок
│   │   └── services/         # Компоненты и хуки каталога услуг
│   ├── pages/                # Inertia page components (Landing, Login, Register, Account, Dashboards)
│   └── utils/                # Утилиты (avatar, service card images)
├── scss/                     # SCSS-архитектура (7-1 inspired)
│   ├── abstracts/            # Переменные, миксины
│   ├── base/                 # Reset, типографика, анимации
│   ├── components/           # Кнопки, формы, таблицы, navbar, UI
│   ├── layout/               # Layout контента
│   └── pages/                # Страничные стили
└── views/
    └── welcome.blade.php     # Корневой Blade-шаблон (точка монтирования Inertia)

database/
├── migrations/               # 10 миграций
├── seeders/                  # DatabaseSeeder, DemoDataSeeder, LeadStatusSeeder, CategorySeeder
└── database.sqlite           # Локальная SQLite БД

tests/
├── Feature/                  # Feature-тесты (минимальные)
├── Unit/                     # Unit-тесты (минимальные)
└── TestCase.php              # Базовый тест-кейс
```

## Build and Development Commands

### Установка зависимостей
```bash
composer install
npm install
```

### Настройка окружения
```bash
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
```

### Разработка
```bash
# Полный dev-стек (Vite + Laravel Serve + Queue) — рекомендуется
npm start                    # или: composer run dev

# По отдельности:
npm run dev                  # Vite dev server
npm run dev:backend          # php artisan serve
```

### Продакшен
```bash
npm run build                # Vite production build
```

### База данных
```bash
php artisan migrate --seed           # Миграции + сидеры
php artisan migrate:fresh --seed     # Полный сброс и пересоздание
php artisan app:seed-demo            # Демо-данные с кастомными количествами
php artisan app:seed-demo --fresh    # Сброс + демо-данные
php artisan app:seed-demo --users=30 --leads=50 --reviews=10 --categories=10 --services=30
```

### Код-стайл
```bash
./vendor/bin/pint              # Laravel Pint (PHP CS Fixer)
```

### Тестирование
```bash
./vendor/bin/phpunit             # Запуск PHPUnit
```

## Code Style Guidelines

### Backend (PHP)
- **Laravel Pint** используется для форматирования PHP-кода.
- Контроллеры возвращают **только JSON** (`response()->json()`), Blade-views не используются (кроме `welcome.blade.php` как точка входа для Inertia).
- Валидация вынесена в **FormRequest-классы** (StoreLeadRequest, UpdateLeadRequest, ServiceRequest и др.).
- **Eloquent Relationships** с активным использованием `with()` для eager loading.
- **Database Transactions** с `lockForUpdate()` для критических операций (claim, confirm заявок).
- **Ролевая модель**: `role` поле в users (`user`, `manager`, `admin`), `status` (`active`, `inactive`).
- Модели используют прямую сериализацию через `toArray()` — **нет Laravel Resources/Transformers**.
- Весь пользовательский интерфейс на **русском языке**, включая сообщения об ошибках API.

### Frontend (JS/React)
- **Feature-based организация**: `features/admin/`, `features/leads/`, `features/services/`.
- **Custom Hooks** для бизнес-логики: `useLeadWorkflow`, `useServicesCatalog`, `useLeadForm`.
- **React Context API** для глобального состояния: AuthContext, ThemeContext, NotifyContext.
- **Inertia.js Pages** — серверный роутинг с клиентским рендерингом.
- **SCSS Architecture** по мотивам 7-1: abstracts, base, components, layout, pages.
- **Glassmorphism UI** с `backdrop-filter`, полупрозрачными фонами.
- **CSS Custom Properties** для полной темной/светлой темы через `data-theme` атрибут.
- **Axios** настроен с `withCredentials: true` и CSRF-заголовками.

### Database Conventions
- Миграции именуются с префиксом даты `2026_01_01_00000X`.
- Поле `status` в leads — виртуальный accessor, физическое поле `lead_status_id`.
- Lead lock mechanism: `locked_by_user_id`, `locked_at`, `lock_expires_at` (TTL 15 минут).

## Testing Strategy

**Текущее состояние**: тестовое покрытие минимально. Существуют только базовые placeholder-тесты:
- `tests/Feature/ExampleTest.php` — проверка HTTP 200 на `/`
- `tests/Unit/ExampleTest.php` — placeholder

**PHPUnit конфигурация** (`phpunit.xml`):
- Тестовое окружение: `APP_ENV=testing`
- Cache/Session: `array` driver
- Queue: `sync`
- Telescope/Pulse: отключены
- DB: не задана явно (можно раскомментировать SQLite in-memory)

**Что НЕ покрыто тестами** (приоритеты для добавления):
- Контроллеры (Auth, Lead, Service, Review, User, Category)
- FormRequest валидация
- Lead workflow (claim/release/assign/confirm)
- Middleware (Admin, Staff)
- Frontend компоненты

## Architecture and Key Patterns

### Authentication & Authorization
- **Session-based auth** через Laravel sessions (не JWT/Sanctum).
- **Custom middleware**:
  - `AdminMiddleware` — проверка `role === 'admin'`
  - `StaffMiddleware` — проверка `role in ['admin', 'manager']`
  - `HandleInertiaRequests` — передача auth-данных в Inertia
- **Guest leads** — возможность создать заявку без регистрации (`user_id` nullable).

### Lead Workflow (Core Business Logic)
1. **Claim** — staff забирает заявку в работу, 15-минутный lock, статус меняется на `in_progress`
2. **Release** — освобождение заявки (админ или тот, кто заблокировал)
3. **Assign** — админ назначает заявку на конкретного менеджера
4. **Confirm** — подтверждение выполнения, сброс lock, статус `confirmed`
5. **Phone Privacy** — телефон скрыт до claim заявки staff-пользователем

### Data Model
- **users** — клиенты, менеджеры, админы (role, status, avatar)
- **categories** — категории туристических услуг
- **services** — услуги (belongsTo category, hasMany leads & reviews)
- **lead_statuses** — справочник статусов заявок (new, in_progress, done, cancelled, confirmed)
- **leads** — заявки клиентов (богатые отношения: user, service, leadStatus, assignedTo, assignedBy, lockedBy)
- **lead_notes** — заметки к заявкам (belongsTo lead, user)
- **reviews** — отзывы (требуют одобрения админом, is_approved)

### API Structure
- Все API-роуты под префиксом `/api` (группировка в `web.php`).
- `api_v1.php` — публичные и аутентифицированные CRUD-операции.
- `admin.php` — staff и admin роуты с middleware `['auth', 'staff']` и `['auth', 'admin']`.
- `auth.php` — аутентификация и профиль.
- Ответы всегда в формате JSON.

### Frontend Routing (Inertia.js)
- `/` — Landing (публичный каталог услуг)
- `/login`, `/register` — guest-only
- `/account` — личный кабинет (auth)
- `/dashboard` — дашборд пользователя (auth)
- `/manager` — дашборд менеджера (auth + staff)
- `/admin` — админ-панель (auth + admin)
- Fallback → redirect на `/`

## Security Considerations

- **CSRF**: Axios настроен с `withCredentials: true` и `X-Requested-With: XMLHttpRequest`.
- **Lead Lock**: Используется `DB::transaction()` с `lockForUpdate()` для предотвращения race conditions при claim/confirm.
- **Phone Privacy**: Телефонные номера скрыты от staff до момента claim заявки.
- **Role-based Access**: Middleware на уровне роутов и проверки в контроллерах.
- **Manager Restrictions**: Менеджеры не могут удалять заявки, могут обновлять только `lead_status_id`/`status`.
- **Review Gate**: Отзывы разрешены только после выполненной (`done`) заявки на данную услугу.
- **Avatar**: Base64-encoded изображения, max 200KB, хранятся в БД.
- **Password Hashing**: Laravel `hashed` cast в User модели.

## Environment and Deployment

### Key Environment Variables
- `APP_URL`, `VITE_API_URL` — координация фронтенд/бэкенд
- `DB_CONNECTION=pgsql` — PostgreSQL по умолчанию
- `SESSION_DRIVER=database`, `CACHE_STORE=database`, `QUEUE_CONNECTION=database` — database-backed сервисы
- Redis сконфигурирован но не обязателен
- AWS S3 поддержка для файлового хранилища

### Vite Config
- Proxy для `/api`, `/images`, `/fonts` на бэкенд (`VITE_API_URL` или `localhost:8000`)
- Entry points: `resources/scss/app.scss` + `resources/js/app.jsx`
- React plugin + Laravel Vite plugin

### Default Accounts (after seeding)
- Admin: `admin@tourist.com` / `password`
- Manager: `manager@tourist.com` / `password`
- Test User: `test@example.com` / `password`

## Development Notes

- **Язык интерфейса**: Русский (все UI-тексты, API-сообщения, seeders).
- **Demo Seeder**: `DemoDataSeeder` генерирует реалистичные русскоязычные данные с Faker `ru_RU`.
- **No API Versioning in Practice**: файл `api_v1.php`, но роуты `/api/...` без версии в URL.
- **No Laravel Resources/Transformers**: модели сериализуются напрямую через Eloquent.
- **Dirty Files**: `ReviewController.php` и `ServiceController.php` имеют незакоммиченные изменения на ветке `develop`.
- **Branch awareness**: при работе с git проверяйте текущую ветку и незакоммиченные изменения.
