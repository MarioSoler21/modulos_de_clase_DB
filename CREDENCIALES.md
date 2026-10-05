# Credenciales de prueba

Los usuarios viven en la tabla `usuarios` de Supabase (claves guardadas con hash scrypt).
No hay registro publico ni Supabase Auth: el administrador crea, edita y borra usuarios
desde `/admin/usuarios`. Estas son las cuentas iniciales que crea la migracion
`20261006000000_usuarios_roles.sql`:

| Usuario  | Clave     | Rol           | Nombre             | Grado |
|----------|-----------|---------------|--------------------|-------|
| admin    | admin123  | admin         | Administracion     | -     |
| maestro1 | profe123  | maestro       | Prof. Ana Martinez | -     |
| maestro2 | profe456  | maestro       | Prof. Luis Herrera | -     |
| alumno1  | alumno123 | estudiante    | Carlos Lopez       | 7mo A |
| alumno2  | alumno456 | estudiante    | Maria Gonzalez     | 7mo A |
| alumno3  | alumno789 | estudiante    | Jose Ramirez       | 8vo B |

Si el administrador cambia una clave desde la app, esta tabla deja de estar al dia.

## Que puede hacer cada rol

- **admin**: crea, edita y borra alumnos, maestros y otros administradores; crea, edita y
  borra clases y decide que maestro imparte cada una; inscribe y quita alumnos de las clases
  (uno por uno o todo un grado de una vez). No edita el contenido de las clases.
- **maestro**: dentro de sus clases crea modulos, agrega recursos y publica u oculta
  modulos. Ve la lista de alumnos inscritos, pero no puede inscribirlos ni quitarlos.
- **estudiante**: ve solo las clases en las que esta inscrito, y solo los modulos publicados.

## Que deberia ver cada uno con los datos de ejemplo

- **admin**: las dos clases y los cinco usuarios en `/admin`.
- **maestro1**: "Matematica" (7mo A) y "Ciencias Naturales" (8vo B).
- **maestro2**: ninguna clase (el admin se la puede asignar).
- **alumno1 / alumno2**: inscritos en "Matematica". Ven "Numeros enteros" y "Fracciones";
  "Geometria basica" esta como borrador y no aparece.
- **alumno3**: inscrito en "Ciencias Naturales".
