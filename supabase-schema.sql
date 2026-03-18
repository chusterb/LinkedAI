-- À exécuter dans Supabase > SQL Editor

-- Table : style de l'utilisateur (ses posts de référence)
create table if not exists user_style (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  posts text[] not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Table : historique des posts générés
create table if not exists posts_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  idea text not null,
  post text not null,
  tone text default 'storytelling',
  rating smallint default null, -- 1 = 👍, -1 = 👎, null = non noté
  created_at timestamptz default now()
);

-- Migration : ajouter la colonne rating si la table existe déjà
-- alter table posts_history add column if not exists rating smallint default null;

-- RLS (Row Level Security) — chaque user ne voit que ses données
alter table user_style enable row level security;
alter table posts_history enable row level security;

create policy "user_style: own rows only" on user_style
  for all using (auth.uid() = user_id);

create policy "posts_history: own rows only" on posts_history
  for all using (auth.uid() = user_id);

-- Migration : ajouter la colonne profile si elle n'existe pas encore
-- alter table user_style add column if not exists profile jsonb;

-- Index pour les requêtes rapides
create index if not exists posts_history_user_id_idx on posts_history(user_id);
create index if not exists posts_history_created_at_idx on posts_history(created_at desc);

-- ─────────────────────────────────────────────────────────────
-- Table : plans utilisateurs (abonnements LemonSqueezy)
-- ─────────────────────────────────────────────────────────────
create table if not exists user_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  lemon_subscription_id text,
  lemon_customer_id text,
  plan_expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table user_plans enable row level security;

create policy "user_plans: own rows only" on user_plans
  for select using (auth.uid() = user_id);

-- Le service role (webhook) peut écrire sans restriction RLS
-- (géré côté serveur avec la service role key)

create index if not exists user_plans_user_id_idx on user_plans(user_id);

-- ─────────────────────────────────────────────────────────────
-- Table : logs de génération (pour la limite quotidienne free)
-- ─────────────────────────────────────────────────────────────
create table if not exists generation_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now()
);

alter table generation_logs enable row level security;

create policy "generation_logs: own rows only" on generation_logs
  for select using (auth.uid() = user_id);

-- Le service role peut insert (via /api/generate avec supabase-server)
-- Pour que le client auth puisse aussi lire son compteur
create policy "generation_logs: insert own" on generation_logs
  for insert with check (auth.uid() = user_id);

create index if not exists generation_logs_user_date_idx on generation_logs(user_id, created_at desc);
