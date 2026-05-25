-- Validar cover_image_url: null, vacio o URL https (Storage, Unsplash, etc.)
-- NOT VALID primero para no bloquear despliegue si hubiera filas legacy; luego validar.

alter table public.chazas
  add constraint chazas_cover_image_url_check
  check (
    cover_image_url is null
    or cover_image_url = ''
    or cover_image_url ~ '^https://'
  )
  not valid;

alter table public.chazas
  validate constraint chazas_cover_image_url_check;

comment on constraint chazas_cover_image_url_check on public.chazas is
  'Portada: null, vacio o URL https (p. ej. Supabase Storage o placeholder externo).';
