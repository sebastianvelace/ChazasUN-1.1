-- Backend hardening — fixes seguros derivados del Supabase Advisor (2026-07-10).
-- Solo cambios ADITIVOS y de bajo riesgo: no se tocan las expresiones de las
-- políticas RLS existentes (eso se documenta como mejora aparte).
--
-- Ejecutar en el SQL Editor de Supabase o con: supabase db push

-- ---------------------------------------------------------------------------
-- 1) Índices sobre claves foráneas sin cubrir (lint 0001_unindexed_foreign_keys).
--    Aditivos: aceleran los joins y los borrados en cascada, no alteran lógica.
-- ---------------------------------------------------------------------------
create index if not exists chaza_categories_category_id_idx
  on public.chaza_categories (category_id);

create index if not exists content_reports_reporter_id_idx
  on public.content_reports (reporter_id);

create index if not exists favorites_chaza_id_idx
  on public.favorites (chaza_id);

create index if not exists reviews_user_id_idx
  on public.reviews (user_id);

-- ---------------------------------------------------------------------------
-- 2) Endurecer la inserción en analytics_events (lint 0024_permissive_rls_policy).
--    La política anterior usaba WITH CHECK (true): cualquiera podía insertar
--    filas arbitrarias. Se mantiene la telemetría anónima (la app la necesita),
--    pero se restringe la forma del evento para limitar el abuso:
--      - session_id y name no vacíos y de longitud acotada,
--      - name dentro del conjunto de eventos que la aplicación emite,
--      - payload acotado en tamaño.
--    La lectura sigue siendo solo para administradores (política intacta).
-- ---------------------------------------------------------------------------
drop policy if exists "analytics_insert_all" on public.analytics_events;

create policy "analytics_insert_valid"
  on public.analytics_events for insert
  to anon, authenticated
  with check (
    char_length(session_id) between 1 and 128
    and char_length(name) between 1 and 64
    -- Lista canónica: types/analytics.ts › AnalyticsEventName.
    -- Debe mantenerse sincronizada con ese tipo; un nombre nuevo que no esté
    -- aquí será rechazado por la base.
    and name in (
      'page_view',
      'swiper_view',
      'swiper_like',
      'swiper_pass',
      'swiper_save',
      'swiper_undo',
      'swiper_card_time',
      'category_click',
      'cta_explorar',
      'cta_publicar_chaza',
      'auth_prompt_shown',
      'auth_prompt_dismissed',
      'map_pin_click'
    )
    and (payload is null or pg_column_size(payload) <= 4096)
  );
