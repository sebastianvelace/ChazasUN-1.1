-- ChazasUN — esquema inicial (Auth + datos publicos)
-- Ejecutar en el SQL Editor de Supabase o con CLI: supabase db push

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Perfiles (1:1 con auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Perfil visible; insert solo via trigger al registrarse.';

-- ---------------------------------------------------------------------------
-- Categorias (seed alineado a config/categories.ts)
-- ---------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sort_order int not null default 0
);

-- ---------------------------------------------------------------------------
-- Chazas
-- ---------------------------------------------------------------------------
create table public.chazas (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  slug text not null unique,
  name text not null,
  description text not null default '',
  location_text text not null default '',
  schedule text not null default '',
  cover_image_url text,
  map_position jsonb,
  geo jsonb,
  building_code text,
  contact_whatsapp text,
  contact_instagram text,
  tags text[] not null default '{}',
  rating real not null default 0,
  review_count int not null default 0,
  status text not null default 'published'
    check (status in ('draft', 'published', 'paused', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index chazas_owner_id_idx on public.chazas (owner_id);
create index chazas_status_idx on public.chazas (status);

create table public.chaza_categories (
  chaza_id uuid not null references public.chazas (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  primary key (chaza_id, category_id)
);

create table public.chaza_products (
  id uuid primary key default gen_random_uuid(),
  chaza_id uuid not null references public.chazas (id) on delete cascade,
  name text not null,
  price_label text,
  sort_order int not null default 0
);

create index chaza_products_chaza_id_idx on public.chaza_products (chaza_id);

create table public.favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  chaza_id uuid not null references public.chazas (id) on delete cascade,
  kind text not null check (kind in ('like', 'save')),
  created_at timestamptz not null default now(),
  primary key (user_id, chaza_id, kind)
);

create index favorites_user_id_idx on public.favorites (user_id);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  chaza_id uuid not null references public.chazas (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  rating smallint not null check (rating >= 1 and rating <= 5),
  body text not null,
  status text not null default 'published'
    check (status in ('published', 'hidden', 'pending')),
  created_at timestamptz not null default now(),
  unique (chaza_id, user_id)
);

create index reviews_chaza_id_idx on public.reviews (chaza_id);

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  name text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index analytics_events_created_at_idx on public.analytics_events (created_at);
create index analytics_events_name_idx on public.analytics_events (name);

-- ---------------------------------------------------------------------------
-- Trigger: crear perfil al registrarse
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
      split_part(coalesce(new.email, 'usuario'), '@', 1)
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.chazas enable row level security;
alter table public.chaza_categories enable row level security;
alter table public.chaza_products enable row level security;
alter table public.favorites enable row level security;
alter table public.reviews enable row level security;
alter table public.analytics_events enable row level security;

-- profiles
create policy "profiles_select_all"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- categories (solo lectura)
create policy "categories_select_all"
  on public.categories for select
  to anon, authenticated
  using (true);

-- chazas: leer publicadas o propias
create policy "chazas_select_published_or_own"
  on public.chazas for select
  to anon, authenticated
  using (
    status = 'published'
    or (auth.uid() is not null and owner_id = auth.uid())
  );

create policy "chazas_insert_own"
  on public.chazas for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "chazas_update_own"
  on public.chazas for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "chazas_delete_own"
  on public.chazas for delete
  to authenticated
  using (owner_id = auth.uid());

-- chaza_categories
create policy "chaza_categories_select_visible"
  on public.chaza_categories for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.chazas c
      where c.id = chaza_id
        and (c.status = 'published' or (auth.uid() is not null and c.owner_id = auth.uid()))
    )
  );

create policy "chaza_categories_write_own"
  on public.chaza_categories for all
  to authenticated
  using (
    exists (
      select 1 from public.chazas c
      where c.id = chaza_id and c.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.chazas c
      where c.id = chaza_id and c.owner_id = auth.uid()
    )
  );

-- chaza_products
create policy "chaza_products_select_visible"
  on public.chaza_products for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.chazas c
      where c.id = chaza_id
        and (c.status = 'published' or (auth.uid() is not null and c.owner_id = auth.uid()))
    )
  );

create policy "chaza_products_write_own"
  on public.chaza_products for all
  to authenticated
  using (
    exists (select 1 from public.chazas c where c.id = chaza_id and c.owner_id = auth.uid())
  )
  with check (
    exists (select 1 from public.chazas c where c.id = chaza_id and c.owner_id = auth.uid())
  );

-- favorites
create policy "favorites_select_own"
  on public.favorites for select
  to authenticated
  using (user_id = auth.uid());

create policy "favorites_insert_own"
  on public.favorites for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "favorites_update_own"
  on public.favorites for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "favorites_delete_own"
  on public.favorites for delete
  to authenticated
  using (user_id = auth.uid());

-- reviews
create policy "reviews_select_published"
  on public.reviews for select
  to anon, authenticated
  using (status = 'published');

create policy "reviews_insert_authenticated"
  on public.reviews for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "reviews_update_own"
  on public.reviews for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- analytics: insert anon para demo (ajusta en produccion)
create policy "analytics_insert_all"
  on public.analytics_events for insert
  to anon, authenticated
  with check (true);

create policy "analytics_select_authenticated"
  on public.analytics_events for select
  to authenticated
  using (false);

-- ---------------------------------------------------------------------------
-- Seed categorias (slugs = frontend)
-- ---------------------------------------------------------------------------
insert into public.categories (slug, name, sort_order) values
  ('cafe-bebidas', 'Cafe y Bebidas', 1),
  ('comida', 'Comida', 2),
  ('servicios', 'Servicios', 3),
  ('papeleria', 'Papeleria', 4),
  ('libros', 'Libros', 5),
  ('tecnologia', 'Tecnologia', 6),
  ('belleza', 'Belleza', 7),
  ('ropa-accesorios', 'Ropa y Accesorios', 8),
  ('arte-manualidades', 'Arte y Manualidades', 9),
  ('deportes', 'Deportes', 10),
  ('musica', 'Musica', 11),
  ('fotografia', 'Fotografia', 12),
  ('transporte', 'Transporte', 13);
