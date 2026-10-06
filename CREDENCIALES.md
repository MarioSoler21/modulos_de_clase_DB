# Credenciales de prueba - Instituto Don Bosco (San Pedro Sula, Honduras)

Los usuarios viven en la tabla `usuarios` de Supabase (claves guardadas con hash scrypt).
No hay registro público ni Supabase Auth: el administrador crea, edita y borra usuarios
desde `/admin/usuarios`. Las cuentas iniciales vienen de la migración
`20261006000000_usuarios_roles.sql` y de `supabase/seed.sql`.

Si el administrador cambia una clave desde la app, esta tabla deja de estar al día.

## Administración

| Usuario | Clave    | Nombre         |
|---------|----------|----------------|
| admin   | admin123 | Administración |

## Maestros

| Usuario  | Clave     | Nombre               | Materia (en 7mo A, 8vo B y 9no A) |
|----------|-----------|----------------------|-----------------------------------|
| maestro1 | profe123  | Prof. Ana Martínez   | Matemáticas                       |
| maestro2 | profe456  | Prof. Luis Herrera   | Español                           |
| maestro3 | profe2026 | Prof. Karla Mejía    | Inglés                            |
| maestro4 | profe2026 | Prof. Roberto Paz    | Computación                       |
| maestro5 | profe2026 | Prof. Sofía Castillo | Literatura                        |
| maestro6 | profe2026 | Prof. Daniel Rivera  | Ciencias Naturales                |
| maestro7 | profe2026 | Prof. Jorge Fúnez    | Estudios Sociales                 |

## Alumnos

Cada alumno está inscrito en las 7 materias de su grado.

| Usuario  | Clave      | Nombre               | Grado |
|----------|------------|----------------------|-------|
| alumno1  | alumno123  | Carlos López         | 7mo A |
| alumno2  | alumno456  | María González       | 7mo A |
| alumno4  | alumno2026 | Valeria Hernández    | 7mo A |
| alumno5  | alumno2026 | Diego Castro         | 7mo A |
| alumno3  | alumno789  | José Ramírez         | 8vo B |
| alumno6  | alumno2026 | Andrea Flores        | 8vo B |
| alumno7  | alumno2026 | Kevin Martínez       | 8vo B |
| alumno8  | alumno2026 | Gabriela Reyes       | 8vo B |
| alumno9  | alumno2026 | Luis Fernando Pineda | 9no A |
| alumno10 | alumno2026 | Daniela Romero       | 9no A |
| alumno11 | alumno2026 | Josué Mejía          | 9no A |
| alumno12 | alumno2026 | Camila Bonilla       | 9no A |

## Qué puede hacer cada rol

- **admin**: panel con resumen del instituto; crea, edita y borra alumnos, maestros y
  administradores; crea, edita y borra clases (materia, grado, maestro, horario, aula y
  descripción); inscribe y quita alumnos desde la clase o desde la ficha del alumno
  (una clase o todas las de su grado); asigna clases a un maestro desde su ficha.
  No edita el contenido de las clases.
- **maestro**: panel con sus clases; dentro de cada clase crea módulos, agrega recursos
  (uno por uno o varios archivos a la vez), decora cada módulo (color e imagen de portada)
  y lo publica u oculta. Crea tareas con fecha y puntaje, califica entregas con nota y
  retroalimentación, y ve el libro de calificaciones con promedios sobre 10. Ve la lista
  de alumnos inscritos, pero no puede inscribirlos ni quitarlos.
- **estudiante**: panel con sus materias, promedio general y próximas entregas; ve solo
  las clases en las que está inscrito y los módulos publicados; entrega tareas (archivo
  y/o comentario, puede reentregar hasta que se califique) y ve sus notas.

## Datos de ejemplo para probar

- **alumno1** tiene tareas vencidas ya calificadas y tareas vigentes sin entregar,
  para probar la entrega.
- **maestro1**, en "Matemáticas - 7mo A", tiene el módulo "Geometría básica" como
  borrador (los alumnos no lo ven) y entregas por calificar en otras clases.
