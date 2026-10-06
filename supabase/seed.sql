-- Datos de ejemplo del Instituto Don Bosco (San Pedro Sula, Honduras).
-- Se puede correr mas de una vez: usa ids fijos o derivados con md5 y "on conflict".
-- Los usuarios iniciales (admin, maestro1-2, alumno1-3) se crean en la migracion
-- 20261006000000_usuarios_roles.sql. Los PDFs de ejemplo se suben con: npm run seed:storage

-- ---------- Usuarios ----------

update public.usuarios set nombre = 'Prof. Ana Martínez' where usuario = 'maestro1';
update public.usuarios set nombre = 'Carlos López' where usuario = 'alumno1';
update public.usuarios set nombre = 'María González' where usuario = 'alumno2';
update public.usuarios set nombre = 'José Ramírez' where usuario = 'alumno3';
update public.usuarios set nombre = 'Administración' where usuario = 'admin';

-- Claves: maestros nuevos "profe2026", alumnos nuevos "alumno2026" (ver CREDENCIALES.md).
insert into public.usuarios (usuario, nombre, rol, grado, clave_hash) values
  ('maestro3', 'Prof. Karla Mejía', 'maestro', null,
   'scrypt$526905d081170473caad7894d436182b$aa451f9863613ee551f344cbabd55033f54ba7927a292d79f7b48609261c2a10be1bd4357706be4b9bf60861c9d35eda0bca1ca01a810c44db2f0be944ac786b'),
  ('maestro4', 'Prof. Roberto Paz', 'maestro', null,
   'scrypt$a24279d715b6e73dc4b91ef5d74f496a$4b178b2f6d067bd3902e9943770bbb653b8bbb4c182aa5a522fc2bb8d6fab95e0e521643aaa1e9f8cfeb31f600a0fc8bdf3e28a8ebc66ba2b5c4f85d909fa202'),
  ('maestro5', 'Prof. Sofía Castillo', 'maestro', null,
   'scrypt$0c85f0ad96cc01c1bd166978985b4563$65211f92f267634a706ead468be2b85241edf32e0f86121bd4d79b78ba62a16041d5c1255a98da8ffdb014b3848c715f3eeea2714f134a6b3df376a6134e93ba'),
  ('maestro6', 'Prof. Daniel Rivera', 'maestro', null,
   'scrypt$231f1742171f249175c04ca397b625e8$474112b06dfcfdd2fb75a1279387806e97b7ca8d5cd0f59a158fb6bf9aa10908f2f9d27c80089bc1c1241816282cbbcd916416624194f6b07d7668faeb794f72'),
  ('maestro7', 'Prof. Jorge Fúnez', 'maestro', null,
   'scrypt$6c8ab2788d985d4fd8a40e49b1efb78b$36b93e3938126cb84d3e809ccee939aa7f3e98c6cce3e3c21bb8700b507803d678667548e9a6a8540bc9459d052206d4d8b4fda357cad6e03145bc28e6d0bc6b'),
  ('alumno4', 'Valeria Hernández', 'estudiante', '7mo A',
   'scrypt$507926e74152c8fe7b1c5273a1aa0f60$86c8442da450cb8b1badef2b01fc89ab6fe63c5073e573278270c7a27216711a417f1994f235807d0b0e23fbbbe938f590d4805f4085b61233f0648487e8ce75'),
  ('alumno5', 'Diego Castro', 'estudiante', '7mo A',
   'scrypt$d40a04cdb1c109a2313237e9df3b70a5$a08cd3ac40e68384797a5435e3fc36cc1c9a601c96cdc6077f938653631d473ef9ed57a84923cbacb37559081db779c7db9e6e4cc04c1116e5810ac7ce23a5a7'),
  ('alumno6', 'Andrea Flores', 'estudiante', '8vo B',
   'scrypt$cca00a9413e45d77d4ce728b50967a24$daad09cc02aed94f621527db7c56e78d9c8eb896c519b9f5997fcd2b995ec828dc3cc8a16ebefbffbcf971e60e8138b5b7129ba8b35aac6753c762674fa969cb'),
  ('alumno7', 'Kevin Martínez', 'estudiante', '8vo B',
   'scrypt$fbed08a4a3601e0abeeb8c74bbde08fc$66c23c3cb952ac71519ad367264212b706c688358e5cfe9df1caacf07e621a8b414fc527869cfe875edee25e98bd94a2195389dec1d3a95ffba5e52aaa06dfe0'),
  ('alumno8', 'Gabriela Reyes', 'estudiante', '8vo B',
   'scrypt$8b5d26c7f5024f4717b1701a27ad358c$1fb4eda25d6e3e9eb5feff81b5c36a7d1149c59b1b8b61faf9567b6948ac668662e7a7717e5eb87871e6e069e38e2b6ad5ba44a2a295c55a3cad90701e560fc5'),
  ('alumno9', 'Luis Fernando Pineda', 'estudiante', '9no A',
   'scrypt$152c10c6bea9134ff1d91ff77e42d697$010df6ef4d68fd0db9a6b83558927d7c09567d77fbb6775bfeeee7aa927d01949d944a1274ae36242eae83b28e1a75e81835bdd10925da7d4ebd7d51d930b1e2'),
  ('alumno10', 'Daniela Romero', 'estudiante', '9no A',
   'scrypt$0c801668ee976818a74cca7f36ca4694$bd19a2fb6cb2323fa66ced17d406f5f40220547469429de29aa8c694d73986359819ed201b769c28ffd1add2741223183c8efbb463f0f11d62458cd50dc0a61f'),
  ('alumno11', 'Josué Mejía', 'estudiante', '9no A',
   'scrypt$5bd22aa3f18f12f2e8b5a4fc9dc55b1a$354d0e063cd120a6ce4f655a148f2f3393710b3148e69a3f339603160167177e1f110f58912dcb437c8af83b69a43d6583e297242b444c69efaaa588f53f6d75'),
  ('alumno12', 'Camila Bonilla', 'estudiante', '9no A',
   'scrypt$7098f9d46ad50b79c3eba4a831eecf92$957debcacaecd1bb8e6c4474968ed24fcb70ed59fc564485c9775e5c1130800fb1f495ceb33a17251652bad6a18f40838e0a28bcf59f0302234c9ccb70bada52')
on conflict (usuario) do nothing;

-- ---------- Materias y grados ----------

create temp table if not exists _materias (materia text primary key, maestro text, descripcion text, horario text);
truncate _materias;
insert into _materias values
  ('Matemáticas', 'maestro1', 'Razonamiento lógico, aritmética y álgebra aplicados a la vida diaria.', 'Lun, Mié y Vie - 7:00 a 7:45'),
  ('Español', 'maestro2', 'Lectura comprensiva, redacción, gramática y expresión oral.', 'Lun a Jue - 7:45 a 8:30'),
  ('Inglés', 'maestro3', 'Comunicación en inglés: vocabulario, gramática y conversación.', 'Mar y Jue - 8:30 a 9:15'),
  ('Literatura', 'maestro5', 'Lectura crítica de obras clásicas, latinoamericanas y hondureñas.', 'Mié y Vie - 9:30 a 10:15'),
  ('Computación', 'maestro4', 'Fundamentos de informática, ofimática y pensamiento computacional.', 'Mar - 10:15 a 11:45 (laboratorio)'),
  ('Ciencias Naturales', 'maestro6', 'Biología, física y química a través de la experimentación.', 'Lun y Jue - 10:15 a 11:00'),
  ('Estudios Sociales', 'maestro7', 'Geografía, historia y cívica de Honduras y Centroamérica.', 'Mié y Vie - 11:00 a 11:45');

create temp table if not exists _grados (grado text primary key, aula text);
truncate _grados;
insert into _grados values
  ('7mo A', 'Aula 12 - Edificio San Juan Bosco'),
  ('8vo B', 'Aula 15 - Edificio San Juan Bosco'),
  ('9no A', 'Aula 21 - Edificio Domingo Savio');

-- Dos clases tienen id fijo porque las usan las pruebas y los datos originales.
insert into public.clases (id, nombre, grado, maestro_usuario, descripcion, horario, aula)
select
  case
    when m.materia = 'Matemáticas' and g.grado = '7mo A' then '11111111-0000-0000-0000-000000000001'::uuid
    when m.materia = 'Ciencias Naturales' and g.grado = '8vo B' then '11111111-0000-0000-0000-000000000002'::uuid
    else md5('clase:' || g.grado || ':' || m.materia)::uuid
  end,
  m.materia, g.grado, m.maestro, m.descripcion, m.horario, g.aula
from _materias m cross join _grados g
on conflict (id) do update set
  nombre = excluded.nombre, grado = excluded.grado, maestro_usuario = excluded.maestro_usuario,
  descripcion = excluded.descripcion, horario = excluded.horario, aula = excluded.aula;

-- Cada alumno queda inscrito en todas las materias de su grado.
insert into public.inscripciones (clase_id, estudiante_usuario)
select c.id, u.usuario
from public.clases c
join public.usuarios u on u.rol = 'estudiante' and u.grado = c.grado
where c.nombre in (select materia from _materias)
on conflict do nothing;

-- ---------- Modulos ----------

-- Modulos originales (Matematicas 7mo A y Ciencias Naturales 8vo B).
insert into public.modulos (id, clase_id, titulo, descripcion, orden, publicado, color) values
  ('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001',
   'Números enteros', 'Suma, resta y recta numérica.', 1, true, 'verde'),
  ('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001',
   'Fracciones', 'Fracciones equivalentes y operaciones básicas.', 2, true, 'naranja'),
  ('22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000001',
   'Geometría básica', 'Borrador: todavía no visible para estudiantes.', 3, false, 'azul'),
  ('22222222-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000002',
   'La célula', 'Partes de la célula y sus funciones.', 1, true, 'morado'),
  ('22222222-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000002',
   'Ecosistemas de Honduras', 'Cadenas alimenticias y biodiversidad de nuestros bosques y arrecifes.', 2, true, 'turquesa')
on conflict (id) do update set titulo = excluded.titulo, descripcion = excluded.descripcion, color = excluded.color;

-- Plantilla de modulos por materia para el resto de clases.
create temp table if not exists _plantilla_modulos (materia text, orden int, titulo text, descripcion text, color text);
truncate _plantilla_modulos;
insert into _plantilla_modulos values
  ('Matemáticas', 1, 'Números enteros y racionales', 'Operaciones, orden y representación en la recta numérica.', 'verde'),
  ('Matemáticas', 2, 'Álgebra: expresiones y ecuaciones', 'Lenguaje algebraico y ecuaciones de primer grado.', 'naranja'),
  ('Español', 1, 'Comprensión lectora', 'Idea principal, inferencias y resumen de textos.', 'azul'),
  ('Español', 2, 'Ortografía y acentuación', 'Reglas de acentuación, tilde diacrítica y signos de puntuación.', 'rojo'),
  ('Inglés', 1, 'Greetings and introductions', 'Saludos, presentaciones personales y expresiones de cortesía.', 'rosa'),
  ('Inglés', 2, 'Present simple', 'Rutinas diarias y verbos en presente simple.', 'morado'),
  ('Literatura', 1, 'Géneros literarios', 'Narrativo, lírico y dramático: características y ejemplos.', 'morado'),
  ('Literatura', 2, 'Literatura hondureña', 'Autores y obras fundamentales: Froylán Turcios, Ramón Amaya Amador y Clementina Suárez.', 'verde'),
  ('Computación', 1, 'Hardware y software', 'Partes de la computadora y tipos de programas.', 'turquesa'),
  ('Computación', 2, 'Procesador de textos y hojas de cálculo', 'Formato de documentos, tablas y fórmulas básicas.', 'azul'),
  ('Ciencias Naturales', 1, 'La célula', 'Estructura y funciones de la célula animal y vegetal.', 'morado'),
  ('Ciencias Naturales', 2, 'Ecosistemas de Honduras', 'Biodiversidad, cadenas alimenticias y conservación.', 'turquesa'),
  ('Estudios Sociales', 1, 'Geografía de Honduras', 'Departamentos, relieve, ríos y regiones del país.', 'verde'),
  ('Estudios Sociales', 2, 'Historia de Centroamérica', 'De la época precolombina a la independencia de 1821.', 'naranja');

insert into public.modulos (id, clase_id, titulo, descripcion, orden, publicado, color)
select md5('modulo:' || c.id || ':' || p.orden)::uuid, c.id, p.titulo, p.descripcion, p.orden, true, p.color
from public.clases c
join _plantilla_modulos p on p.materia = c.nombre
where c.id not in ('11111111-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002')
on conflict (id) do nothing;

-- ---------- Recursos ----------

insert into public.recursos (id, modulo_id, tipo, titulo, storage_path, video_url) values
  ('33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001',
   'pdf', 'Guía de ejercicios: números enteros', 'seed/guia-numeros-enteros.pdf', null),
  ('33333333-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000001',
   'video', 'Video: la recta numérica', null, 'https://www.youtube.com/watch?v=hRwHSo8nUU0'),
  ('33333333-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000002',
   'anuncio', 'Traer regla y compás el lunes', null, null),
  ('33333333-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000004',
   'pdf', 'Lectura: partes de la célula', 'seed/lectura-la-celula.pdf', null),
  ('33333333-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000000004',
   'video', 'Video: célula animal y vegetal', null, 'https://www.youtube.com/watch?v=cf9Z0M616a4'),
  ('33333333-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000000005',
   'enlace', 'Lectura complementaria: ecosistemas', null, 'https://es.wikipedia.org/wiki/Ecosistema')
on conflict (id) do update set titulo = excluded.titulo;

create temp table if not exists _plantilla_recursos (materia text, orden_modulo int, n int, tipo text, titulo text, storage_path text, url text);
truncate _plantilla_recursos;
insert into _plantilla_recursos values
  ('Matemáticas', 1, 1, 'pdf', 'Guía de ejercicios: números enteros', 'seed/guia-numeros-enteros.pdf', null),
  ('Matemáticas', 1, 2, 'video', 'Video: la recta numérica', null, 'https://www.youtube.com/watch?v=hRwHSo8nUU0'),
  ('Matemáticas', 2, 1, 'pdf', 'Guía: lenguaje algebraico', 'seed/matematicas-algebra.pdf', null),
  ('Matemáticas', 2, 2, 'anuncio', 'Prueba corta de ecuaciones el próximo viernes', null, null),
  ('Español', 1, 1, 'pdf', 'Lectura: "El Sombrerón" (leyenda hondureña)', 'seed/espanol-lectura.pdf', null),
  ('Español', 1, 2, 'enlace', 'Estrategias de comprensión lectora', null, 'https://es.wikipedia.org/wiki/Comprensi%C3%B3n_lectora'),
  ('Español', 2, 1, 'pdf', 'Reglas de acentuación (resumen)', 'seed/espanol-acentuacion.pdf', null),
  ('Inglés', 1, 1, 'video', 'Video: greetings and introducing people', null, 'https://www.youtube.com/watch?v=6lE4O6fXpgs'),
  ('Inglés', 1, 2, 'pdf', 'Vocabulary list: greetings', 'seed/ingles-vocabulario.pdf', null),
  ('Inglés', 2, 1, 'enlace', 'Simple present (reference)', null, 'https://en.wikipedia.org/wiki/Simple_present'),
  ('Literatura', 1, 1, 'pdf', 'Cuadro comparativo de géneros literarios', 'seed/literatura-generos.pdf', null),
  ('Literatura', 2, 1, 'enlace', 'Ramón Amaya Amador y "Prisión verde"', null, 'https://es.wikipedia.org/wiki/Prisi%C3%B3n_verde'),
  ('Literatura', 2, 2, 'anuncio', 'Traer el libro de lectura para el club de lectura del jueves', null, null),
  ('Computación', 1, 1, 'video', 'Video: hardware y software', null, 'https://www.youtube.com/watch?v=_mMXzn4zoQA'),
  ('Computación', 1, 2, 'pdf', 'Guía: partes de la computadora', 'seed/computacion-partes.pdf', null),
  ('Computación', 2, 1, 'anuncio', 'La clase del martes es en el laboratorio 2', null, null),
  ('Ciencias Naturales', 1, 1, 'pdf', 'Lectura: partes de la célula', 'seed/lectura-la-celula.pdf', null),
  ('Ciencias Naturales', 1, 2, 'video', 'Video: célula animal y vegetal', null, 'https://www.youtube.com/watch?v=cf9Z0M616a4'),
  ('Ciencias Naturales', 2, 1, 'enlace', 'Parque Nacional Cusuco (San Pedro Sula)', null, 'https://es.wikipedia.org/wiki/Parque_nacional_Cusuco'),
  ('Estudios Sociales', 1, 1, 'pdf', 'Mapa de los 18 departamentos de Honduras', 'seed/sociales-departamentos.pdf', null),
  ('Estudios Sociales', 1, 2, 'enlace', 'Geografía de Honduras', null, 'https://es.wikipedia.org/wiki/Geograf%C3%ADa_de_Honduras'),
  ('Estudios Sociales', 2, 1, 'enlace', 'Independencia de Centroamérica', null, 'https://es.wikipedia.org/wiki/Independencia_de_Centroam%C3%A9rica');

insert into public.recursos (id, modulo_id, tipo, titulo, storage_path, video_url)
select md5('recurso:' || m.id || ':' || p.n)::uuid, m.id, p.tipo, p.titulo, p.storage_path, p.url
from public.modulos m
join public.clases c on c.id = m.clase_id
join _plantilla_recursos p on p.materia = c.nombre and p.orden_modulo = m.orden
where m.id = md5('modulo:' || c.id || ':' || m.orden)::uuid
on conflict (id) do nothing;

-- ---------- Tareas ----------

insert into public.tareas (id, modulo_id, titulo, instrucciones, fecha_entrega, puntaje_max) values
  ('44444444-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001',
   'Ejercicios de la guía', 'Resuelve los ejercicios 1 al 10 de la guía y sube una foto o PDF de tu cuaderno.',
   (date_trunc('day', now() at time zone 'America/Tegucigalpa') + interval '7 days 23 hours 59 minutes') at time zone 'America/Tegucigalpa', 10),
  ('44444444-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000004',
   'Dibujo de la célula', 'Dibuja una célula animal y una vegetal, señala sus partes y sube una foto.',
   (date_trunc('day', now() at time zone 'America/Tegucigalpa') + interval '10 days 23 hours 59 minutes') at time zone 'America/Tegucigalpa', 20)
on conflict (id) do update set titulo = excluded.titulo, instrucciones = excluded.instrucciones;

-- Cada clase: una evaluacion diagnostica ya vencida (con notas) y una tarea vigente.
create temp table if not exists _plantilla_tareas (materia text, k int, orden_modulo int, titulo text, instrucciones text, dias int, puntaje numeric);
truncate _plantilla_tareas;
insert into _plantilla_tareas values
  ('Matemáticas', 1, 1, 'Evaluación diagnóstica', 'Resuelve la evaluación diagnóstica de números enteros y sube tus procedimientos.', -12, 10),
  ('Matemáticas', 2, 2, 'Ecuaciones de primer grado', 'Resuelve las 8 ecuaciones de la guía mostrando cada paso.', 6, 20),
  ('Español', 1, 1, 'Resumen de "El Sombrerón"', 'Lee la leyenda y escribe un resumen de media página con la idea principal.', -10, 10),
  ('Español', 2, 2, 'Dictado de palabras con tilde', 'Clasifica 30 palabras en agudas, graves y esdrújulas.', 5, 20),
  ('Inglés', 1, 1, 'Self-introduction', 'Write a short paragraph introducing yourself: name, age, family and hobbies.', -9, 10),
  ('Inglés', 2, 2, 'My daily routine', 'Write 10 sentences about your daily routine using the present simple.', 8, 20),
  ('Literatura', 1, 1, 'Cuadro de géneros literarios', 'Completa el cuadro comparativo con un ejemplo de cada género.', -11, 10),
  ('Literatura', 2, 2, 'Ficha de lectura', 'Elabora una ficha de lectura de un cuento hondureño: autor, personajes, tema y opinión.', 9, 20),
  ('Computación', 1, 1, 'Partes de la computadora', 'Identifica 10 partes de la computadora y clasifícalas en entrada, salida o almacenamiento.', -8, 10),
  ('Computación', 2, 2, 'Tabla de notas en Excel', 'Crea una hoja de cálculo con tus materias y calcula el promedio con una fórmula.', 7, 20),
  ('Ciencias Naturales', 1, 1, 'Cuestionario de la célula', 'Responde el cuestionario de 10 preguntas sobre los organelos.', -13, 10),
  ('Ciencias Naturales', 2, 2, 'Cadena alimenticia hondureña', 'Dibuja una cadena alimenticia con especies de un ecosistema de Honduras.', 10, 20),
  ('Estudios Sociales', 1, 1, 'Mapa de Honduras', 'Ubica los 18 departamentos y sus cabeceras en el mapa.', -7, 10),
  ('Estudios Sociales', 2, 2, 'Línea de tiempo de la independencia', 'Elabora una línea de tiempo con 8 hechos clave hasta 1821.', 12, 20);

insert into public.tareas (id, modulo_id, titulo, instrucciones, fecha_entrega, puntaje_max, created_at)
select md5('tarea:' || c.id || ':' || p.k)::uuid, m.id, p.titulo, p.instrucciones,
       (date_trunc('day', now() at time zone 'America/Tegucigalpa') + make_interval(days => p.dias) + interval '23 hours 59 minutes') at time zone 'America/Tegucigalpa',
       p.puntaje, now() - interval '20 days' + make_interval(days => p.k)
from public.clases c
join _plantilla_tareas p on p.materia = c.nombre
join public.modulos m on m.clase_id = c.id and m.orden = p.orden_modulo
where c.nombre in (select materia from _materias)
on conflict (id) do nothing;

-- ---------- Entregas y notas de ejemplo ----------
-- Las tareas vencidas tienen entrega y nota de casi todos los alumnos; las vigentes
-- tienen algunas entregas sin calificar. alumno1 y alumno3 quedan sin entregas en las
-- tareas vigentes para poder probar la entrega.
insert into public.entregas (tarea_id, estudiante_usuario, comentario, entregada_at, nota, retroalimentacion, calificada_at)
select t.id, i.estudiante_usuario,
  (array['Adjunto mi trabajo, profe.', 'Aquí está mi tarea.', 'Entrego la actividad completa.', 'Hice todos los ejercicios.'])[1 + h % 4],
  case when t.fecha_entrega < now() then t.fecha_entrega - make_interval(hours => h % 60) else now() - make_interval(hours => h % 48) end,
  case when t.fecha_entrega < now() then round(t.puntaje_max * (5.5 + (h % 45) / 10.0) / 10, 1) end,
  case when t.fecha_entrega < now() then (array[
    'Excelente trabajo, sigue así.',
    'Buen esfuerzo; revisa los ejercicios marcados.',
    'Bien. Cuida la presentación y la ortografía.',
    'Puedes mejorar: repasa el tema y consulta tus dudas en clase.'])[1 + h % 4] end,
  case when t.fecha_entrega < now() then t.fecha_entrega + interval '2 days' end
from public.tareas t
join public.modulos m on m.id = t.modulo_id
join public.inscripciones i on i.clase_id = m.clase_id
cross join lateral (select abs(('x' || substr(md5(t.id::text || i.estudiante_usuario), 1, 8))::bit(32)::int) as h) x
where t.id = md5('tarea:' || m.clase_id || ':' || case when t.fecha_entrega < now() then 1 else 2 end)::uuid
  and (
    (t.fecha_entrega < now() and h % 100 < 88)
    or (t.fecha_entrega >= now() and h % 100 < 40 and i.estudiante_usuario not in ('alumno1', 'alumno3'))
  )
on conflict (tarea_id, estudiante_usuario) do nothing;


-- ---------- Semanas ----------
-- Tres semanas por clase; la semana 3 es la semana actual (empieza el lunes de esta semana,
-- hora de Honduras). Cada modulo queda en la semana de su mismo orden.
insert into public.semanas (id, clase_id, numero, fecha_inicio)
select md5('semana:' || c.id || ':' || n)::uuid, c.id, n,
       (date_trunc('week', now() at time zone 'America/Tegucigalpa'))::date - 14 + (n - 1) * 7
from public.clases c
cross join generate_series(1, 3) as n
where c.nombre in (select materia from _materias)
on conflict (clase_id, numero) do nothing;

update public.modulos m set semana_id = s.id
from public.semanas s
where s.clase_id = m.clase_id and s.numero = m.orden and m.semana_id is null;

drop table if exists _materias, _grados, _plantilla_modulos, _plantilla_recursos, _plantilla_tareas;
