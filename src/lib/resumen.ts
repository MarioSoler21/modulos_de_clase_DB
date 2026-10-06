import "server-only";
import { promedio } from "./calificaciones";
import { supabaseServer } from "./supabase/server";
import type { Clase, Entrega, Tarea } from "./tipos";

// Datos agregados para los paneles de inicio de cada rol.

type Conteo = { count: number }[];
const contar = (c: Conteo | undefined) => c?.[0]?.count ?? 0;

// ---------- Maestro ----------

export interface ClaseMaestro extends Clase {
  alumnos: number;
  modulos: number;
  tareas: number;
  porCalificar: number;
}

export async function resumenMaestro(usuario: string): Promise<ClaseMaestro[]> {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("clases")
    .select("*, inscripciones(count), modulos(count)")
    .eq("maestro_usuario", usuario)
    .order("grado")
    .order("nombre");
  if (error) throw new Error(error.message);
  const clases = (data ?? []) as (Clase & { inscripciones: Conteo; modulos: Conteo })[];
  const ids = clases.map((c) => c.id);

  const [tareas, pendientes] = ids.length
    ? await Promise.all([
        supabase.from("tareas").select("id, modulos!inner(clase_id)").in("modulos.clase_id", ids),
        supabase
          .from("entregas")
          .select("id, tareas!inner(modulos!inner(clase_id))")
          .in("tareas.modulos.clase_id", ids)
          .is("nota", null)
          .not("entregada_at", "is", null),
      ])
    : [{ data: [] }, { data: [] }];

  const claseDeTarea = (f: { modulos: unknown }) => (f.modulos as { clase_id: string }).clase_id;
  const claseDeEntrega = (f: { tareas: unknown }) =>
    (f.tareas as { modulos: { clase_id: string } }).modulos.clase_id;

  return clases.map(({ inscripciones, modulos, ...c }) => ({
    ...c,
    alumnos: contar(inscripciones),
    modulos: contar(modulos),
    tareas: (tareas.data ?? []).filter((t) => claseDeTarea(t) === c.id).length,
    porCalificar: (pendientes.data ?? []).filter((e) => claseDeEntrega(e) === c.id).length,
  }));
}

// ---------- Estudiante ----------

export type TareaConClase = Tarea & { clase_id: string; clase_nombre: string; modulo_titulo: string };

export interface ClaseEstudiante extends Clase {
  maestro: string | null;
  pendientes: number;
  promedio: number | null;
}

export interface ResumenEstudiante {
  clases: ClaseEstudiante[];
  proximas: TareaConClase[];
  vencidas: TareaConClase[];
  promedioGeneral: number | null;
  calificadas: number;
  totalTareas: number;
}

export async function resumenEstudiante(usuario: string): Promise<ResumenEstudiante> {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("clases")
    .select("*, inscripciones!inner(estudiante_usuario), maestro:usuarios!clases_maestro_fk(nombre)")
    .eq("inscripciones.estudiante_usuario", usuario)
    .order("nombre");
  if (error) throw new Error(error.message);
  const filas = (data ?? []) as (Clase & { maestro: { nombre: string } | null })[];
  const ids = filas.map((c) => c.id);
  const nombreClase = new Map(filas.map((c) => [c.id, c.nombre]));

  const { data: tareasData } = ids.length
    ? await supabase
        .from("tareas")
        .select("*, modulos!inner(clase_id, publicado, titulo)")
        .in("modulos.clase_id", ids)
        .eq("modulos.publicado", true)
        .order("fecha_entrega")
    : { data: [] };
  const tareas: TareaConClase[] = (tareasData ?? []).map(({ modulos, ...t }) => {
    const m = modulos as { clase_id: string; titulo: string };
    return { ...(t as Tarea), clase_id: m.clase_id, clase_nombre: nombreClase.get(m.clase_id) ?? "", modulo_titulo: m.titulo };
  });

  const { data: entregasData } = tareas.length
    ? await supabase
        .from("entregas")
        .select("*")
        .eq("estudiante_usuario", usuario)
        .in(
          "tarea_id",
          tareas.map((t) => t.id),
        )
    : { data: [] };
  const entregas = (entregasData ?? []) as Entrega[];
  const porTarea = new Map(entregas.map((e) => [e.tarea_id, e]));
  const ahora = Date.now();

  const sinEntregar = tareas.filter((t) => !porTarea.get(t.id)?.entregada_at && porTarea.get(t.id)?.nota == null);
  const esVencida = (t: Tarea) => !!t.fecha_entrega && new Date(t.fecha_entrega).getTime() < ahora;

  const clases: ClaseEstudiante[] = filas.map(({ maestro, ...c }) => {
    const deClase = tareas.filter((t) => t.clase_id === c.id);
    return {
      ...(c as Clase),
      maestro: maestro?.nombre ?? null,
      pendientes: sinEntregar.filter((t) => t.clase_id === c.id && !esVencida(t)).length,
      promedio: promedio(deClase, entregas),
    };
  });

  return {
    clases,
    proximas: sinEntregar.filter((t) => !esVencida(t)),
    vencidas: sinEntregar.filter(esVencida),
    promedioGeneral: promedio(tareas, entregas),
    calificadas: entregas.filter((e) => e.nota !== null).length,
    totalTareas: tareas.length,
  };
}

// ---------- Administrador ----------

export interface ResumenAdmin {
  alumnos: number;
  maestros: number;
  clases: number;
  inscripciones: number;
  porGrado: { grado: string; alumnos: number; clases: number }[];
  sinMaestro: { id: string; nombre: string; grado: string }[];
  alumnosSinClases: { usuario: string; nombre: string; grado: string | null }[];
  ultimasEntregas: { alumno: string; tarea: string; clase: string; fecha: string; nota: number | null }[];
  maestros_lista: { usuario: string; nombre: string; clases: number }[];
}

export async function resumenAdmin(): Promise<ResumenAdmin> {
  const supabase = supabaseServer();
  const [usuarios, clases, inscripciones, entregas] = await Promise.all([
    supabase.from("usuarios").select("usuario, nombre, rol, grado").order("nombre"),
    supabase.from("clases").select("id, nombre, grado, maestro_usuario").order("grado").order("nombre"),
    supabase.from("inscripciones").select("clase_id, estudiante_usuario"),
    supabase
      .from("entregas")
      .select("entregada_at, nota, usuarios(nombre), tareas!inner(titulo, modulos!inner(clases!inner(nombre, grado)))")
      .not("entregada_at", "is", null)
      .order("entregada_at", { ascending: false })
      .limit(6),
  ]);
  const error = usuarios.error ?? clases.error ?? inscripciones.error ?? entregas.error;
  if (error) throw new Error(error.message);

  const us = usuarios.data ?? [];
  const cs = clases.data ?? [];
  const ins = inscripciones.data ?? [];
  const alumnos = us.filter((u) => u.rol === "estudiante");
  const maestros = us.filter((u) => u.rol === "maestro");
  const conClase = new Set(ins.map((i) => i.estudiante_usuario));
  const grados = [...new Set([...alumnos.map((a) => a.grado), ...cs.map((c) => c.grado)].filter(Boolean))].sort();

  return {
    alumnos: alumnos.length,
    maestros: maestros.length,
    clases: cs.length,
    inscripciones: ins.length,
    porGrado: grados.map((g) => ({
      grado: g as string,
      alumnos: alumnos.filter((a) => a.grado === g).length,
      clases: cs.filter((c) => c.grado === g).length,
    })),
    sinMaestro: cs.filter((c) => !c.maestro_usuario).map(({ id, nombre, grado }) => ({ id, nombre, grado })),
    alumnosSinClases: alumnos
      .filter((a) => !conClase.has(a.usuario))
      .map(({ usuario, nombre, grado }) => ({ usuario, nombre, grado })),
    ultimasEntregas: (entregas.data ?? []).map((e) => {
      const t = e.tareas as unknown as { titulo: string; modulos: { clases: { nombre: string; grado: string } } };
      return {
        alumno: (e.usuarios as unknown as { nombre: string } | null)?.nombre ?? "",
        tarea: t.titulo,
        clase: `${t.modulos.clases.nombre} - ${t.modulos.clases.grado}`,
        fecha: e.entregada_at as string,
        nota: e.nota as number | null,
      };
    }),
    maestros_lista: maestros.map((m) => ({
      usuario: m.usuario,
      nombre: m.nombre,
      clases: cs.filter((c) => c.maestro_usuario === m.usuario).length,
    })),
  };
}
