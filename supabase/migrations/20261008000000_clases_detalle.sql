-- Datos adicionales de cada clase para mostrar en las tarjetas.
alter table public.clases
  add column if not exists descripcion text,
  add column if not exists horario text,
  add column if not exists aula text;
