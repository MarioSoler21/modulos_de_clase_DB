-- Semanas (estilo Canvas) y personalizacion de la clase por el maestro.
--
-- Jerarquia: clase -> semanas -> modulos -> recursos/tareas.
-- Cada semana tiene numero, titulo opcional, fecha de inicio (lunes) y una imagen
-- de banner. Un modulo puede quedar sin semana (semana_id null).

create table if not exists public.semanas (
  id            uuid primary key default gen_random_uuid(),
  clase_id      uuid not null references public.clases (id) on delete cascade,
  numero        int  not null check (numero > 0),
  titulo        text,
  descripcion   text,
  fecha_inicio  date,
  portada_path  text,
  created_at    timestamptz not null default now(),
  unique (clase_id, numero)
);

create index if not exists semanas_clase_idx on public.semanas (clase_id, numero);

alter table public.modulos
  add column if not exists semana_id uuid references public.semanas (id) on delete set null;

create index if not exists modulos_semana_idx on public.modulos (semana_id);

-- Icono y tema de color elegidos por el maestro. Null = segun la materia.
alter table public.clases
  add column if not exists icono text,
  add column if not exists tema text;

alter table public.semanas enable row level security;
