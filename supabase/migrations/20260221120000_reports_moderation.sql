-- Fase 3: reportes de contenido y moderacion admin

create table public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  target_type text not null check (target_type in ('chaza', 'review')),
  target_id uuid not null,
  reason text not null,
  details text,
  status text not null default 'pending' check (status in ('pending', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

create index content_reports_pending_idx on public.content_reports (created_at desc)
  where status = 'pending';

comment on table public.content_reports is 'Denuncias de usuarios; solo admins resuelven.';

alter table public.content_reports enable row level security;

create policy "content_reports_select_own_or_admin"
  on public.content_reports for select
  to authenticated
  using (
    reporter_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

create policy "content_reports_insert_own"
  on public.content_reports for insert
  to authenticated
  with check (reporter_id = auth.uid());

create policy "content_reports_update_admin"
  on public.content_reports for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- Admin puede moderar chazas y reseñas de terceros
create policy "chazas_update_admin"
  on public.chazas for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

create policy "reviews_update_admin"
  on public.reviews for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );
