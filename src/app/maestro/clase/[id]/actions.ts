"use server";

import { revalidatePath } from "next/cache";
import { claseDeUsuario, moduloDeMaestro } from "@/lib/acceso";
import { requerirRol } from "@/lib/sesion";
import { supabaseServer } from "@/lib/supabase/server";

export interface EstadoForm {
  error?: string;
  ok?: number;
}

export async function crearModulo(claseId: string, _prev: EstadoForm, form: FormData): Promise<EstadoForm> {
  const u = await requerirRol("maestro");
  const clase = await claseDeUsuario(u, claseId);
  if (!clase) return { error: "Clase no encontrada." };

  const titulo = String(form.get("titulo") ?? "").trim();
  const descripcion = String(form.get("descripcion") ?? "").trim();
  const orden = Number(form.get("orden"));
  const publicado = form.get("publicado") === "on";

  if (!titulo) return { error: "El titulo es obligatorio." };
  if (!Number.isInteger(orden) || orden < 0) return { error: "El orden debe ser un numero entero." };

  const { error } = await supabaseServer()
    .from("modulos")
    .insert({ clase_id: clase.id, titulo, descripcion: descripcion || null, orden, publicado });
  if (error) return { error: `No se pudo crear el modulo: ${error.message}` };

  revalidatePath(`/maestro/clase/${clase.id}`);
  return { ok: Date.now() };
}

export async function alternarPublicado(moduloId: string) {
  const u = await requerirRol("maestro");
  const modulo = await moduloDeMaestro(u, moduloId);
  if (!modulo) return;

  await supabaseServer().from("modulos").update({ publicado: !modulo.publicado }).eq("id", modulo.id);
  revalidatePath(`/maestro/clase/${modulo.clase_id}`);
}
