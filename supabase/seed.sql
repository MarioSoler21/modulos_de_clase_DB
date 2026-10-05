-- Datos de ejemplo. UUIDs fijos para poder correrlo mas de una vez.
-- Los usuarios iniciales se crean en la migracion 20261006000000_usuarios_roles.sql.
-- Los PDFs de ejemplo se suben a Storage con: npm run seed:storage

insert into public.clases (id, nombre, grado, maestro_usuario) values
  ('11111111-0000-0000-0000-000000000001', 'Matematica',         '7mo A', 'maestro1'),
  ('11111111-0000-0000-0000-000000000002', 'Ciencias Naturales', '8vo B', 'maestro1')
on conflict (id) do nothing;

insert into public.modulos (id, clase_id, titulo, descripcion, orden, publicado) values
  ('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001',
   'Numeros enteros', 'Suma, resta y recta numerica.', 1, true),
  ('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001',
   'Fracciones', 'Fracciones equivalentes y operaciones basicas.', 2, true),
  ('22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000001',
   'Geometria basica', 'Borrador: todavia no visible para estudiantes.', 3, false),
  ('22222222-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000002',
   'La celula', 'Partes de la celula y sus funciones.', 1, true),
  ('22222222-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000002',
   'Ecosistemas', 'Cadenas alimenticias y relaciones entre seres vivos.', 2, true)
on conflict (id) do nothing;

insert into public.recursos (id, modulo_id, tipo, titulo, storage_path, video_url) values
  ('33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001',
   'pdf', 'Guia de ejercicios: numeros enteros', 'seed/guia-numeros-enteros.pdf', null),
  ('33333333-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000001',
   'video', 'Video: la recta numerica', null, 'https://www.youtube.com/watch?v=hRwHSo8nUU0'),
  ('33333333-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000002',
   'anuncio', 'Traer regla y compas el lunes', null, null),
  ('33333333-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000004',
   'pdf', 'Lectura: partes de la celula', 'seed/lectura-la-celula.pdf', null),
  ('33333333-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000000004',
   'video', 'Video: celula animal y vegetal', null, 'https://www.youtube.com/watch?v=cf9Z0M616a4'),
  ('33333333-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000000005',
   'enlace', 'Lectura complementaria sobre ecosistemas', null, 'https://es.wikipedia.org/wiki/Ecosistema')
on conflict (id) do nothing;

insert into public.inscripciones (clase_id, estudiante_usuario) values
  ('11111111-0000-0000-0000-000000000001', 'alumno1'),
  ('11111111-0000-0000-0000-000000000001', 'alumno2'),
  ('11111111-0000-0000-0000-000000000002', 'alumno3')
on conflict do nothing;
