-- Plataforma de modulos de clase - Colegio Don Bosco
-- Tablas: clases -> modulos -> recursos, y bucket privado "materiales".

create extension if not exists "pgcrypto";

create table if not exists public.clases (
  id               uuid primary key default gen_random_uuid(),
  nombre           text not null,
  grado            text not null,
  maestro_usuario  text not null
);

create index if not exists clases_maestro_idx on public.clases (maestro_usuario);
create index if not exists clases_grado_idx   on public.clases (grado);

create table if not exists public.modulos (
  id           uuid primary key default gen_random_uuid(),
  clase_id     uuid not null references public.clases (id) on delete cascade,
  titulo       text not null,
  descripcion  text,
  orden        int  not null default 0,
  publicado    bool not null default true
);

create index if not exists modulos_clase_idx on public.modulos (clase_id, orden);

create table if not exists public.recursos (
  id            uuid primary key default gen_random_uuid(),
  modulo_id     uuid not null references public.modulos (id) on delete cascade,
  tipo          text not null
                check (tipo in ('pdf', 'doc', 'excel', 'imagen', 'video', 'enlace', 'anuncio')),
  titulo        text not null,
  storage_path  text,
  video_url     text,
  created_at    timestamptz not null default now(),
  -- Documentos van a Storage; video guarda una URL externa (nunca se sube el archivo).
  constraint recursos_documento_con_archivo
    check (tipo not in ('pdf', 'doc', 'excel', 'imagen') or storage_path is not null),
  constraint recursos_video_con_url
    check (tipo <> 'video' or video_url is not null)
);

create index if not exists recursos_modulo_idx on public.recursos (modulo_id, created_at);

-- RLS activado sin politicas: la anon key no tiene acceso.
-- Todo el acceso pasa por el servidor con la service role key.
alter table public.clases   enable row level security;
alter table public.modulos  enable row level security;
alter table public.recursos enable row level security;

-- Bucket PRIVADO para documentos (10MB por archivo).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'materiales',
  'materiales',
  false,
  10485760,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp'
  ]
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
