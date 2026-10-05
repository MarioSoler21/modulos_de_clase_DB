import "server-only";
import { COLUMNAS_USUARIO } from "./sesion";
import { supabaseServer } from "./supabase/server";
import type { Rol, Usuario } from "./tipos";

// Consultas de lectura para las pantallas del administrador.

export async function listarUsuarios(rol?: Rol): Promise<Usuario[]> {
  let q = supabaseServer().from("usuarios").select(COLUMNAS_USUARIO).order("nombre");
  if (rol) q = q.eq("rol", rol);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as Usuario[];
}

// Grados existentes (de alumnos y clases) para sugerir en los formularios.
export async function gradosConocidos(): Promise<string[]> {
  const supabase = supabaseServer();
  const [u, c] = await Promise.all([
    supabase.from("usuarios").select("grado").not("grado", "is", null),
    supabase.from("clases").select("grado"),
  ]);
  const todos = [...(u.data ?? []), ...(c.data ?? [])].map((f) => f.grado as string);
  return [...new Set(todos)].sort();
}

export function ListaGrados({ id, grados }: { id: string; grados: string[] }) {
  return (
    <datalist id={id}>
      {grados.map((g) => (
        <option key={g} value={g} />
      ))}
    </datalist>
  );
}
