-- Fase 2: Storage portadas, admin en profiles, lectura analytics para admins

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

comment on column public.profiles.is_admin is 'Acceso a panel /admin y lectura de analytics_events.';

-- Bucket publico para portadas de chazas
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'chaza-covers',
  'chaza-covers',
  true,
  5242880,
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Lectura publica de portadas
create policy "chaza_covers_select_public"
  on storage.objects for select
  to public
  using (bucket_id = 'chaza-covers');

-- Subida: carpeta = user id (primer segmento del path)
create policy "chaza_covers_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'chaza-covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "chaza_covers_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'chaza-covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "chaza_covers_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'chaza-covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Analytics: admins leen agregados (insert sigue abierto en migracion inicial)
drop policy if exists "analytics_select_authenticated" on public.analytics_events;

create policy "analytics_select_admin"
  on public.analytics_events for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );
