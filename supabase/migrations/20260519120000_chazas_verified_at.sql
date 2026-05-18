-- Fase 5.2: sello "verificada por ChazasUN" (solo admins; dueños no pueden auto-asignar).

alter table public.chazas
  add column if not exists verified_at timestamptz null;

comment on column public.chazas.verified_at is 'Marca de verificacion por equipo ChazasUN; null = no verificada.';

-- RPC: administradores con is_admin en profiles actualizan sin ser dueños.
create or replace function public.admin_set_chaza_verified(p_slug text, p_verified boolean)
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

  update public.chazas
  set
    verified_at = case when p_verified then now() else null end,
    updated_at = now()
  where slug = p_slug;

  if not found then
    raise exception 'chaza not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.admin_set_chaza_verified(text, boolean) from public;
grant execute on function public.admin_set_chaza_verified(text, boolean) to authenticated;

-- Dueño no admin no puede cambiar verified_at (actualizaciones via cliente).
create or replace function public.chazas_guard_verified_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin boolean;
begin
  if new.verified_at is distinct from old.verified_at then
    if auth.uid() is null then
      return new;
    end if;

    select coalesce(is_admin, false) into v_admin
    from public.profiles
    where id = auth.uid();

    if v_admin then
      return new;
    end if;

    new.verified_at := old.verified_at;
  end if;
  return new;
end;
$$;

drop trigger if exists chazas_guard_verified_at on public.chazas;
create trigger chazas_guard_verified_at
  before update on public.chazas
  for each row
  execute procedure public.chazas_guard_verified_at();
