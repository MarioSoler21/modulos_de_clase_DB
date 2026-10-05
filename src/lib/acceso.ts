import "server-only";
import { esUuid } from "./recursos";
import { supabaseServer } from "./supabase/server";
import type { Clase, Modulo, Recurso, Usuario } from "./tipos";

// Reglas de acceso:
// - admin: gestiona usuarios, clases e inscripciones (no el contenido de las clases).
// - maestro: solo sus clases; ve a los alumnos inscritos pero no los modifica.
// - estudiante: solo las clases en las que esta inscrito, y solo modulos publicados.

export type ModuloConRecursos = Modulo & { recursos: Recurso[] };

async function estaInscrito(estudiante: string, claseId: string): Promise<boolean> {
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
  const { data, error } = await supabaseServer().from("clases").select("*").eq("id", claseId).maybeSingle();
  if (error) throw new Error(error.message);
  const clase = data as Clase | null;
  if (!clase) return null;

  if (u.rol === "admin") return clase;
  if (u.rol === "maestro") return clase.maestro_usuario === u.usuario ? clase : null;
  return (await estaInscrito(u.usuario, clase.id)) ? clase : null;
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
    .select("*, recursos(*)")
    .eq("clase_id", claseId)
    .order("orden")
    .order("created_at", { referencedTable: "recursos" });
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
