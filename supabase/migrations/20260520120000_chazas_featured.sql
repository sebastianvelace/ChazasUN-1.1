-- Fase 5.3: destacados temporales (solo admins; no afectan orden del swiper).
alter table public.chazas
  add column if not exists featured_until timestamptz null;

alter table public.chazas
  add column if not exists featured_rank int null;

comment on column public.chazas.featured_until is 'Fin de campaña destacada; null = no destacada. Visible en franja aparte del explorador.';
comment on column public.chazas.featured_rank is 'Orden en franja destacados (menor = primero); null si no destacada.';

create or replace function public.admin_set_chaza_featured(
  p_slug text,
  p_until timestamptz,
  p_rank int
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin boolean;
begin
  select coalesce(is_admin, false) into v_admin
  from public.profiles
  where id = auth.uid();

  if not v_admin then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  if p_until is null then
    update public.chazas
    set
      featured_until = null,
      featured_rank = null,
      updated_at = now()
    where slug = p_slug;
  else
    update public.chazas
    set
      featured_until = p_until,
      featured_rank = coalesce(p_rank, 0),
      updated_at = now()
    where slug = p_slug;
  end if;

  if not found then
    raise exception 'chaza not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.admin_set_chaza_featured(text, timestamptz, int) from public;
grant execute on function public.admin_set_chaza_featured(text, timestamptz, int) to authenticated;

-- Dueño no admin no puede mutar destacados (actualizaciones via cliente).
create or replace function public.chazas_guard_featured()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin boolean;
  v_feature_changed boolean;
begin
  v_feature_changed :=
    new.featured_until is distinct from old.featured_until
    or new.featured_rank is distinct from old.featured_rank;

  if not v_feature_changed then
    return new;
  end if;

  if auth.uid() is null then
    return new;
  end if;

  select coalesce(is_admin, false) into v_admin
  from public.profiles
  where id = auth.uid();

  if v_admin then
    return new;
  end if;

  new.featured_until := old.featured_until;
  new.featured_rank := old.featured_rank;
  return new;
end;
$$;

drop trigger if exists chazas_guard_featured on public.chazas;
create trigger chazas_guard_featured
  before update on public.chazas
  for each row
  execute procedure public.chazas_guard_featured();
