-- Security guards: prevent privilege escalation and rating tampering via direct row updates.
--
-- Context: the RLS policies profiles_update_own and chazas_update_own only restrict
-- WHICH ROW a user can update (auth.uid() = id / owner_id), not WHICH COLUMNS.
-- Without column-level guards, an authenticated user could set is_admin = true on their
-- own profile row (self-promotion to admin), or set rating / review_count on their own
-- chaza. These triggers mirror the existing chazas_guard_verified_at / chazas_guard_featured
-- pattern: revert protected columns unless the caller is an admin (is_admin) or the change
-- comes from a server context where auth.uid() is null (service_role / SECURITY DEFINER RPC).

-- 1) profiles.is_admin — only real admins (or server context) may change it.
create or replace function public.profiles_guard_is_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin boolean;
begin
  if new.is_admin is distinct from old.is_admin then
    -- Server / service_role context: auth.uid() is null -> allowed.
    if auth.uid() is null then
      return new;
    end if;

    select coalesce(is_admin, false) into v_admin
    from public.profiles
    where id = auth.uid();

    if v_admin then
      return new;
    end if;

    -- Non-admin attempting to change is_admin -> revert to previous value.
    new.is_admin := old.is_admin;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_is_admin on public.profiles;
create trigger profiles_guard_is_admin
  before update on public.profiles
  for each row
  execute procedure public.profiles_guard_is_admin();

-- 2) chazas.rating / review_count — frozen against direct writes by authenticated users.
--    These columns are currently only set at creation (to 0) and are never updated by any
--    server action, so freezing them for user sessions is safe. If aggregate ratings are
--    introduced later, recompute them from a SECURITY DEFINER trigger on public.reviews
--    (auth.uid() is null there) rather than relaxing this guard.
create or replace function public.chazas_guard_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null then
    new.rating := old.rating;
    new.review_count := old.review_count;
  end if;
  return new;
end;
$$;

drop trigger if exists chazas_guard_rating on public.chazas;
create trigger chazas_guard_rating
  before update on public.chazas
  for each row
  execute procedure public.chazas_guard_rating();
