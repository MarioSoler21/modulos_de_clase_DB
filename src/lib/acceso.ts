import "server-only";
import { esUuid } from "./recursos";
import { supabaseServer } from "./supabase/server";
import type { Clase, Entrega, Modulo, Recurso, Semana, Tarea, Usuario } from "./tipos";

// Reglas de acceso:
// - admin: gestiona usuarios, clases e inscripciones (no el contenido de las clases).
// - maestro: solo sus clases; ve a los alumnos inscritos pero no los modifica.
// - estudiante: solo las clases en las que esta inscrito, y solo modulos publicados.

export type ModuloConRecursos = Modulo & { recursos: Recurso[]; tareas: Tarea[] };

export async function estaInscrito(estudiante: string, claseId: string): Promise<boolean> {
  const { count, error } = await supabaseServer()
    .from("inscripciones")
    .select("clase_id", { count: "exact", head: true })
    .eq("clase_id", claseId)
    .eq("estudiante_usuario", estudiante);
  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}

export async function claseDeUsuario(u: Usuario, claseId: string): Promise<Clase | null> {
  if (!esUuid(claseId)) return null;
  // Para el alumno, la clase y su inscripcion se consultan en paralelo.
  const [{ data, error }, inscrito] = await Promise.all([
    supabaseServer().from("clases").select("*").eq("id", claseId).maybeSingle(),
    u.rol === "estudiante" ? estaInscrito(u.usuario, claseId) : Promise.resolve(false),
  ]);
  if (error) throw new Error(error.message);
  const clase = data as Clase | null;
  if (!clase) return null;

  if (u.rol === "admin") return clase;
  if (u.rol === "maestro") return clase.maestro_usuario === u.usuario ? clase : null;
  return inscrito ? clase : null;
}

export async function clasesDeEstudiante(estudiante: string): Promise<Clase[]> {
  const { data, error } = await supabaseServer()
    .from("clases")
    .select("*, inscripciones!inner(estudiante_usuario)")
    .eq("inscripciones.estudiante_usuario", estudiante)
    .order("nombre");
  if (error) throw new Error(error.message);
  return (data ?? []).map(({ inscripciones: _i, ...c }) => c as Clase);
}

export async function alumnosDeClase(claseId: string): Promise<Usuario[]> {
  const { data, error } = await supabaseServer()
    .from("inscripciones")
    .select("usuarios(usuario, nombre, rol, grado)")
    .eq("clase_id", claseId);
  if (error) throw new Error(error.message);
  return (data ?? [])
    .map((f) => f.usuarios as unknown as Usuario)
    .filter(Boolean)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export async function modulosDeClase(claseId: string, soloPublicados: boolean): Promise<ModuloConRecursos[]> {
  let q = supabaseServer()
    .from("modulos")
    .select("*, recursos(*), tareas(*)")
    .eq("clase_id", claseId)
    .order("orden")
    .order("created_at", { referencedTable: "recursos" })
    .order("created_at", { referencedTable: "tareas" });
  if (soloPublicados) q = q.eq("publicado", true);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as ModuloConRecursos[];
}

// Devuelve el modulo si pertenece a una clase del maestro.
export async function moduloDeMaestro(u: Usuario, moduloId: string): Promise<Modulo | null> {
  if (u.rol !== "maestro" || !esUuid(moduloId)) return null;
  const { data, error } = await supabaseServer()
    .from("modulos")
    .select("*, clases!inner(maestro_usuario)")
    .eq("id", moduloId)
    .eq("clases.maestro_usuario", u.usuario)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Modulo | null;
}

// Devuelve el recurso si el usuario tiene permiso para verlo.
export async function recursoVisible(u: Usuario, recursoId: string): Promise<Recurso | null> {
  if (u.rol === "admin" || !esUuid(recursoId)) return null;
  const { data, error } = await supabaseServer()
    .from("recursos")
    .select("*, modulos!inner(publicado, clase_id, clases!inner(maestro_usuario))")
    .eq("id", recursoId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const modulo = data.modulos as { publicado: boolean; clase_id: string; clases: { maestro_usuario: string | null } };
  const permitido =
    u.rol === "maestro"
      ? modulo.clases.maestro_usuario === u.usuario
      : modulo.publicado && (await estaInscrito(u.usuario, modulo.clase_id));
  return permitido ? (data as Recurso) : null;
}

// ---------- Tareas y entregas ----------

export type TareaConClase = Tarea & { clase_id: string; modulo_titulo: string; publicado: boolean };

async function tareaConClase(tareaId: string): Promise<TareaConClase | null> {
  if (!esUuid(tareaId)) return null;
  const { data, error } = await supabaseServer()
    .from("tareas")
    .select("*, modulos!inner(titulo, publicado, clase_id)")
    .eq("id", tareaId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const { modulos, ...tarea } = data as Tarea & { modulos: { titulo: string; publicado: boolean; clase_id: string } };
  return { ...tarea, clase_id: modulos.clase_id, modulo_titulo: modulos.titulo, publicado: modulos.publicado };
}

// Tarea de una clase del maestro.
export async function tareaDeMaestro(u: Usuario, tareaId: string): Promise<{ tarea: TareaConClase; clase: Clase } | null> {
  if (u.rol !== "maestro") return null;
  const tarea = await tareaConClase(tareaId);
  if (!tarea) return null;
  const clase = await claseDeUsuario(u, tarea.clase_id);
  return clase ? { tarea, clase } : null;
}

// Tarea que el alumno puede ver y entregar: modulo publicado y alumno inscrito.
export async function tareaDeEstudiante(u: Usuario, tareaId: string): Promise<TareaConClase | null> {
  if (u.rol !== "estudiante") return null;
  const tarea = await tareaConClase(tareaId);
  if (!tarea || !tarea.publicado) return null;
  return (await estaInscrito(u.usuario, tarea.clase_id)) ? tarea : null;
}

export async function entregasDeTareas(tareaIds: string[], estudiante?: string): Promise<Entrega[]> {
  if (tareaIds.length === 0) return [];
  let q = supabaseServer().from("entregas").select("*").in("tarea_id", tareaIds);
  if (estudiante) q = q.eq("estudiante_usuario", estudiante);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as Entrega[];
}

// Entrega visible: el alumno que la hizo o el maestro de la clase.
export async function entregaVisible(u: Usuario, entregaId: string): Promise<Entrega | null> {
  if (!esUuid(entregaId)) return null;
  const { data, error } = await supabaseServer().from("entregas").select("*").eq("id", entregaId).maybeSingle();
  if (error) throw new Error(error.message);
  const entrega = data as Entrega | null;
  if (!entrega) return null;
  if (u.rol === "estudiante") return entrega.estudiante_usuario === u.usuario ? entrega : null;
  if (u.rol === "maestro") return (await tareaDeMaestro(u, entrega.tarea_id)) ? entrega : null;
  return null;
}

// Entregas de un alumno en una clase (sin necesitar antes la lista de tareas).
export async function entregasDeAlumnoEnClase(estudiante: string, claseId: string): Promise<Entrega[]> {
  const { data, error } = await supabaseServer()
    .from("entregas")
    .select("*, tareas!inner(modulos!inner(clase_id))")
    .eq("estudiante_usuario", estudiante)
    .eq("tareas.modulos.clase_id", claseId);
  if (error) throw new Error(error.message);
  return (data ?? []).map(({ tareas: _t, ...e }) => e as Entrega);
}

// ---------- Semanas ----------

export async function semanasDeClase(claseId: string): Promise<Semana[]> {
  const { data, error } = await supabaseServer().from("semanas").select("*").eq("clase_id", claseId).order("numero");
  if (error) throw new Error(error.message);
  return (data ?? []) as Semana[];
}

// Semana de una clase del maestro.
export async function semanaDeMaestro(u: Usuario, semanaId: string): Promise<Semana | null> {
  if (u.rol !== "maestro" || !esUuid(semanaId)) return null;
  const { data, error } = await supabaseServer()
    .from("semanas")
    .select("*, clases!inner(maestro_usuario)")
    .eq("id", semanaId)
    .eq("clases.maestro_usuario", u.usuario)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const { clases: _c, ...semana } = data;
  return semana as Semana;
}
