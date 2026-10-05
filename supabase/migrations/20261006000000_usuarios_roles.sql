-- Roles: admin, maestro, estudiante.
-- Los usuarios pasan de un archivo de config a la tabla "usuarios" (sigue sin Supabase Auth:
-- el login compara contra clave_hash con scrypt desde el servidor).
-- Los alumnos ven solo las clases en las que estan inscritos (tabla "inscripciones").

create table if not exists public.usuarios (
  usuario     text primary key
              check (usuario ~ '^[a-z0-9._-]{3,40}$'),
  nombre      text not null,
  rol         text not null check (rol in ('admin', 'maestro', 'estudiante')),
  grado       text,
  clave_hash  text not null,
  created_at  timestamptz not null default now(),
  constraint usuarios_grado_solo_estudiante
    check (rol = 'estudiante' or grado is null)
);

create index if not exists usuarios_rol_idx on public.usuarios (rol, nombre);

-- Usuarios iniciales (claves en CREDENCIALES.md). Formato: scrypt$salt$hash
insert into public.usuarios (usuario, nombre, rol, grado, clave_hash) values
  ('admin', 'Administracion', 'admin', null,
   'scrypt$887e8d91ac1d834b1f9ded728d733f61$276940c11b3dc5720f4ccc1eb1da72c836c3a6c8a5a44f636de0bd63995f1c9e6c72b9a0d75e0f1fff83c2323239e658c0ee5e18c2074b9214bc259a28e4c307'),
  ('maestro1', 'Prof. Ana Martinez', 'maestro', null,
   'scrypt$faa1a2fefd826318d8318887ae42d545$4f06b8b30a33f1f448c7b829b06a9caec354415067a7e4724f0908d520bfa92cc84e5f32e4cbed739ddfb302c4620ae6ef57923c2a9969f5ef3b787d4eee7f27'),
  ('maestro2', 'Prof. Luis Herrera', 'maestro', null,
   'scrypt$73b8bd4a2cde0c2dea9681e515e057a2$01692763077ba4876e71809d9ac1ed16d1b2784ec0d1dd13ac5d4a5a261e71c883a7b9cf35daeb3ec67f0b901a8ba9d9f2db065f41a20ab783305320c1ff27fb'),
  ('alumno1', 'Carlos Lopez', 'estudiante', '7mo A',
   'scrypt$948be10d26d791f112ed1dc97e336681$0a77e512944493289b6455102684cba83fff3824daa3f9728538f4a9d6e1bca13e4ae19f359ec85ed982f2ec2a220393f882cfed7767a133b2d4004622c49067'),
  ('alumno2', 'Maria Gonzalez', 'estudiante', '7mo A',
   'scrypt$c12775dd7a208a8d310b7ca97c426ce3$b9e2a307bbaec02d3820f2754b921873ae4743e4663b6e7fc4b4e83b7f952c990cce07514dc8e4a3f505b01b65e92e34984ec50dfe10c6a3f0105705e3644a49'),
  ('alumno3', 'Jose Ramirez', 'estudiante', '8vo B',
   'scrypt$b5b123d8b5798ec17f10fd2a7d5b0de1$3446994e10aeadcd61e36e431c58e8462f67f1bed72a9c5cf46e91dcf167fb73e59f1ec6fa72af8b75f71643a8e338210cbc4520082c1cb91048b3f5067318fb')
on conflict (usuario) do nothing;

-- Una clase puede quedar sin maestro si el admin borra al maestro.
alter table public.clases alter column maestro_usuario drop not null;
alter table public.clases drop constraint if exists clases_maestro_fk;
alter table public.clases
  add constraint clases_maestro_fk foreign key (maestro_usuario)
  references public.usuarios (usuario) on update cascade on delete set null;

create table if not exists public.inscripciones (
  clase_id            uuid not null references public.clases (id) on delete cascade,
  estudiante_usuario  text not null references public.usuarios (usuario) on update cascade on delete cascade,
  created_at          timestamptz not null default now(),
  primary key (clase_id, estudiante_usuario)
);

create index if not exists inscripciones_estudiante_idx on public.inscripciones (estudiante_usuario);

-- Mantiene lo que cada alumno veia antes (por grado) como inscripciones explicitas.
insert into public.inscripciones (clase_id, estudiante_usuario)
select c.id, u.usuario
from public.clases c
join public.usuarios u on u.rol = 'estudiante' and u.grado = c.grado
on conflict do nothing;

alter table public.usuarios      enable row level security;
alter table public.inscripciones enable row level security;
