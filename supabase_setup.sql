-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- Enable RLS helper
create extension if not exists "uuid-ossp";

-- INCOMES
create table if not exists incomes (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  amount numeric not null,
  currency text not null,
  source text not null,
  note text,
  date text not null,
  "createdAt" text not null
);
alter table incomes enable row level security;
create policy "users own incomes" on incomes for all using (auth.uid() = user_id);

-- EXPENSES
create table if not exists expenses (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  amount numeric not null,
  currency text not null,
  category text not null,
  note text,
  date text not null,
  "createdAt" text not null
);
alter table expenses enable row level security;
create policy "users own expenses" on expenses for all using (auth.uid() = user_id);

-- SAVINGS
create table if not exists savings (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  amount numeric not null,
  currency text not null,
  note text,
  date text not null,
  "createdAt" text not null
);
alter table savings enable row level security;
create policy "users own savings" on savings for all using (auth.uid() = user_id);

-- INVESTMENTS (stores full JSON per row via jsonb columns for flexible types)
create table if not exists investments (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null,
  "createdAt" text not null,
  name text,
  "coinName" text,
  symbol text,
  quantity numeric,
  "purchasePrice" numeric,
  principal numeric,
  currency text not null,
  apr numeric,
  "interestRate" numeric,
  "startDate" text,
  "endDate" text,
  "purchaseDate" text
);
alter table investments enable row level security;
create policy "users own investments" on investments for all using (auth.uid() = user_id);

-- DEBTS (payments stored as jsonb array)
create table if not exists debts (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  direction text not null,
  name text not null,
  amount numeric not null,
  currency text not null,
  note text,
  "dueDate" text,
  "createdAt" text not null,
  payments jsonb not null default '[]'
);
alter table debts enable row level security;
create policy "users own debts" on debts for all using (auth.uid() = user_id);

-- SUBSCRIPTIONS
create table if not exists subscriptions (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  price numeric not null,
  currency text not null,
  "billingCycle" text not null,
  "nextBillingDate" text not null,
  note text,
  "createdAt" text not null
);
alter table subscriptions enable row level security;
create policy "users own subscriptions" on subscriptions for all using (auth.uid() = user_id);

-- USER SETTINGS
create table if not exists user_settings (
  id uuid primary key references auth.users(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade not null,
  base_currency text not null default 'USD'
);
alter table user_settings enable row level security;
create policy "users own settings" on user_settings for all using (auth.uid() = user_id);
