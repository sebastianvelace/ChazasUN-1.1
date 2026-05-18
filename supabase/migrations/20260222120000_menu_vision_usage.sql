-- Uso de vision API (carta): limite por usuario sin exponer analytics_events a no-admins.
create table if not exists public.menu_vision_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists menu_vision_usage_user_time_idx
  on public.menu_vision_usage (user_id, created_at desc);

alter table public.menu_vision_usage enable row level security;

create policy "menu_vision_usage_insert_own"
  on public.menu_vision_usage for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "menu_vision_usage_select_own"
  on public.menu_vision_usage for select
  to authenticated
  using (user_id = auth.uid());
