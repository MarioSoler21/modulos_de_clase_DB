-- Tareas con entregas y calificaciones, y decoracion de modulos (color y portada).

-- Decoracion del modulo.
alter table public.modulos
  add column if not exists color text not null default 'azul',
  add column if not exists portada_path text;

alter table public.modulos drop constraint if exists modulos_color_check;
alter table public.modulos
  add constraint modulos_color_check
  check (color in ('azul', 'verde', 'rojo', 'naranja', 'morado', 'rosa', 'turquesa', 'gris'));

-- Tareas: pertenecen a un modulo.
create table if not exists public.tareas (
  id             uuid primary key default gen_random_uuid(),
  modulo_id      uuid not null references public.modulos (id) on delete cascade,
  titulo         text not null,
  instrucciones  text,
  fecha_entrega  timestamptz,
  puntaje_max    numeric(6, 2) not null default 10 check (puntaje_max > 0),
  created_at     timestamptz not null default now()
);

create index if not exists tareas_modulo_idx on public.tareas (modulo_id, created_at);

-- Entregas: una por alumno y tarea. El maestro puede calificar aunque el alumno
-- no haya entregado (entregada_at queda en null).
create table if not exists public.entregas (
  id                  uuid primary key default gen_random_uuid(),
  tarea_id            uuid not null references public.tareas (id) on delete cascade,
  estudiante_usuario  text not null references public.usuarios (usuario) on update cascade on delete cascade,
  comentario          text,
  storage_path        text,
  nombre_archivo      text,
  entregada_at        timestamptz,
  nota                numeric(6, 2) check (nota is null or nota >= 0),
  retroalimentacion   text,
  calificada_at       timestamptz,
  unique (tarea_id, estudiante_usuario)
);

create index if not exists entregas_estudiante_idx on public.entregas (estudiante_usuario);

alter table public.tareas   enable row level security;
alter table public.entregas enable row level security;
