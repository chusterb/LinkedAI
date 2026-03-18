-- ─────────────────────────────────────────────────────────────
-- Collections : dossiers pour regrouper les posts générés
-- ─────────────────────────────────────────────────────────────

-- Table : collections (dossiers)
create table if not exists post_collections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now()
);

-- Table : appartenance post <-> collection (many-to-many)
create table if not exists post_collection_items (
  id uuid default gen_random_uuid() primary key,
  collection_id uuid references post_collections(id) on delete cascade not null,
  post_id uuid references posts_history(id) on delete cascade not null,
  added_at timestamptz default now(),
  unique(collection_id, post_id)
);

-- RLS
alter table post_collections enable row level security;
alter table post_collection_items enable row level security;

create policy "post_collections: own rows only" on post_collections
  for all using (auth.uid() = user_id);

-- Pour collection_items : l'utilisateur doit posséder la collection parente
create policy "post_collection_items: own rows only" on post_collection_items
  for all using (
    exists (
      select 1 from post_collections c
      where c.id = collection_id and c.user_id = auth.uid()
    )
  );

-- Index
create index if not exists post_collections_user_id_idx on post_collections(user_id);
create index if not exists post_collection_items_collection_idx on post_collection_items(collection_id);
create index if not exists post_collection_items_post_idx on post_collection_items(post_id);
