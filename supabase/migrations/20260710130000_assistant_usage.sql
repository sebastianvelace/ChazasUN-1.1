-- Asistente de chazas: límite de uso por usuario (mismo patrón que menu_vision_usage).
-- Requiere sesión para acotar el abuso del endpoint de IA.

create table if not exists public.assistant_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists assistant_usage_user_time_idx
  on public.assistant_usage (user_id, created_at desc);

alter table public.assistant_usage enable row level security;

create policy "assistant_usage_insert_own"
  on public.assistant_usage for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "assistant_usage_select_own"
  on public.assistant_usage for select
  to authenticated
  using (user_id = (select auth.uid()));
