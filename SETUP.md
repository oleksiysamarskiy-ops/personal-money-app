# Настройка базы данных (Supabase)

## 1. Создайте проект на Supabase
Перейдите на https://supabase.com → New Project

## 2. Запустите SQL-миграцию
- Откройте: Dashboard → SQL Editor
- Скопируйте содержимое файла `supabase_setup.sql`
- Нажмите Run

## 3. Настройте переменные окружения
Скопируйте `.env.example` в `.env.local`:
```
cp .env.example .env.local
```

Заполните данными из Supabase Dashboard → Settings → API:
```
VITE_SUPABASE_URL=https://ваш-проект.supabase.co
VITE_SUPABASE_ANON_KEY=ваш-anon-ключ
```

## 4. ⚠️ Отключите подтверждение email (опционально)
Supabase Dashboard → Authentication → Providers → Email → 
**Отключите "Confirm email"** — тогда регистрация будет мгновенной без письма.

## 5. Запустите проект
```
npm install
npm run dev
```
