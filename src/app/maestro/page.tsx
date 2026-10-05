import ListaClases from "@/components/ListaClases";
import { requerirRol } from "@/lib/sesion";
import { supabaseServer } from "@/lib/supabase/server";
import type { Clase } from "@/lib/tipos";

export default async function MaestroPage() {
  const u = await requerirRol("maestro");
  const { data, error } = await supabaseServer()
    .from("clases")
    .select("*")
    .eq("maestro_usuario", u.usuario)
    .order("nombre");
  if (error) throw new Error(error.message);

  return (
    <>
      <h1 className="mb-4 text-2xl font-semibold">Mis clases</h1>
      <ListaClases clases={(data ?? []) as Clase[]} base="/maestro" vacio="Todavia no tienes clases asignadas." />
    </>
  );
}
