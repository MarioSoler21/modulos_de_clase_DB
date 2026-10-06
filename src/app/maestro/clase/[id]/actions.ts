"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { claseDeUsuario, estaInscrito, moduloDeMaestro, semanaDeMaestro, tareaDeMaestro } from "@/lib/acceso";
import { ICONOS, TEMAS } from "@/lib/materias";
import { lunesDe } from "@/lib/semanas";
import { LISTA_COLORES } from "@/lib/decoracion";
import type { EstadoForm } from "@/lib/formulario";
import { EXTENSIONES, MAX_BYTES, extension, nombreSeguro } from "@/lib/recursos";
import { requerirRol } from "@/lib/sesion";
import { BUCKET_MATERIALES, supabaseServer } from "@/lib/supabase/server";
import type { ColorModulo } from "@/lib/tipos";

export type { EstadoForm };

const ok = (mensaje: string): EstadoForm => ({ ok: Date.now(), mensaje });

// Valida y sube una imagen (portada de modulo o banner de semana) al bucket privado.
async function subirImagen(carpeta: string, archivo: File): Promise<{ path: string } | { error: string }> {
  if (archivo.size > MAX_BYTES) return { error: "La imagen supera el límite de 10MB." };
  const contentType = EXTENSIONES.imagen?.[extension(archivo.name)];
  if (!contentType) return { error: "La imagen debe ser PNG, JPG, GIF o WEBP." };

  const path = `${carpeta}/${randomUUID()}-${nombreSeguro(archivo.name)}`;
  const { error } = await supabaseServer().storage.from(BUCKET_MATERIALES).upload(path, archivo, { contentType });
  return error ? { error: `No se pudo subir la imagen: ${error.message}` } : { path };
}

// Devuelve el id de la semana si pertenece a la clase; null si viene vacio.
async function semanaDeClase(claseId: string, valor: FormDataEntryValue | null): Promise<string | null | false> {
  const id = String(valor ?? "");
  if (!id) return null;
  const { data } = await supabaseServer().from("semanas").select("id").eq("id", id).eq("clase_id", claseId).maybeSingle();
  return data ? data.id : false;
}

export async function crearModulo(claseId: string, _prev: EstadoForm, form: FormData): Promise<EstadoForm> {
  const u = await requerirRol("maestro");
  const clase = await claseDeUsuario(u, claseId);
  if (!clase) return { error: "Clase no encontrada." };

  const titulo = String(form.get("titulo") ?? "").trim();
  const descripcion = String(form.get("descripcion") ?? "").trim();
  const orden = Number(form.get("orden"));
  const publicado = form.get("publicado") === "on";

  if (!titulo) return { error: "El título es obligatorio." };
  if (!Number.isInteger(orden) || orden < 0) return { error: "El orden debe ser un número entero." };
  const semanaId = await semanaDeClase(clase.id, form.get("semana_id"));
  if (semanaId === false) return { error: "Semana inválida." };

  const { error } = await supabaseServer()
    .from("modulos")
    .insert({ clase_id: clase.id, titulo, descripcion: descripcion || null, orden, publicado, semana_id: semanaId });
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

// ---------- Decoracion ----------

export async function decorarModulo(moduloId: string, _prev: EstadoForm, form: FormData): Promise<EstadoForm> {
  const u = await requerirRol("maestro");
  const modulo = await moduloDeMaestro(u, moduloId);
  if (!modulo) return { error: "Módulo no encontrado." };

  const color = String(form.get("color") ?? "") as ColorModulo;
  if (!LISTA_COLORES.includes(color)) return { error: "Color inválido." };

  const supabase = supabaseServer();
  const cambios: { color: ColorModulo; portada_path?: string | null; semana_id?: string | null } = { color };
  const portada = form.get("portada");
  const viejaPortada = modulo.portada_path;

  if (form.has("semana_id")) {
    const semanaId = await semanaDeClase(modulo.clase_id, form.get("semana_id"));
    if (semanaId === false) return { error: "Semana inválida." };
    cambios.semana_id = semanaId;
  }

  if (portada instanceof File && portada.size > 0) {
    const subida = await subirImagen(`clases/${modulo.clase_id}/portadas/${modulo.id}`, portada);
    if ("error" in subida) return { error: subida.error };
    cambios.portada_path = subida.path;
  } else if (form.get("quitar_portada") === "on") {
    cambios.portada_path = null;
  }

  const { error } = await supabase.from("modulos").update(cambios).eq("id", modulo.id);
  if (error) return { error: error.message };

  if (cambios.portada_path !== undefined && viejaPortada) {
    await supabase.storage.from(BUCKET_MATERIALES).remove([viejaPortada]);
  }

  revalidatePath(`/maestro/clase/${modulo.clase_id}`);
  return ok("Cambios guardados.");
}

// ---------- Tareas ----------

export async function crearTarea(moduloId: string, _prev: EstadoForm, form: FormData): Promise<EstadoForm> {
  const u = await requerirRol("maestro");
  const modulo = await moduloDeMaestro(u, moduloId);
  if (!modulo) return { error: "Módulo no encontrado." };

  const titulo = String(form.get("titulo") ?? "").trim();
  const instrucciones = String(form.get("instrucciones") ?? "").trim();
  const fecha = String(form.get("fecha_entrega") ?? "").trim();
  const puntaje = Number(String(form.get("puntaje_max") ?? "").replace(",", "."));

  if (!titulo) return { error: "El título es obligatorio." };
  if (!(puntaje > 0) || puntaje > 1000) return { error: "El puntaje maximo debe ser mayor que 0." };

  // datetime-local llega sin zona horaria: se interpreta como hora de Honduras (UTC-6, sin horario de verano).
  let fechaEntrega: string | null = null;
  if (fecha) {
    const d = new Date(`${fecha}:00-06:00`);
    if (Number.isNaN(d.getTime())) return { error: "Fecha de entrega inválida." };
    fechaEntrega = d.toISOString();
  }

  const { error } = await supabaseServer().from("tareas").insert({
    modulo_id: modulo.id,
    titulo,
    instrucciones: instrucciones || null,
    fecha_entrega: fechaEntrega,
    puntaje_max: puntaje,
  });
  if (error) return { error: `No se pudo crear la tarea: ${error.message}` };

  revalidatePath(`/maestro/clase/${modulo.clase_id}`);
  return ok("Tarea creada.");
}

export async function borrarTarea(tareaId: string, _prev: EstadoForm, _form: FormData): Promise<EstadoForm> {
  const u = await requerirRol("maestro");
  const datos = await tareaDeMaestro(u, tareaId);
  if (!datos) return { error: "Tarea no encontrada." };

  const supabase = supabaseServer();
  const { data: entregas } = await supabase
    .from("entregas")
    .select("storage_path")
    .eq("tarea_id", tareaId)
    .not("storage_path", "is", null);
  const paths = (entregas ?? []).map((e) => e.storage_path as string);
  if (paths.length) await supabase.storage.from(BUCKET_MATERIALES).remove(paths);

  const { error } = await supabase.from("tareas").delete().eq("id", tareaId);
  if (error) return { error: error.message };

  revalidatePath(`/maestro/clase/${datos.clase.id}`);
  redirect(`/maestro/clase/${datos.clase.id}`);
}

// Califica (o borra la calificacion si la nota queda vacia). Funciona aunque el
// alumno no haya entregado nada.
export async function calificar(
  tareaId: string,
  estudiante: string,
  _prev: EstadoForm,
  form: FormData,
): Promise<EstadoForm> {
  const u = await requerirRol("maestro");
  const datos = await tareaDeMaestro(u, tareaId);
  if (!datos) return { error: "Tarea no encontrada." };
  if (!(await estaInscrito(estudiante, datos.clase.id))) return { error: "El alumno no está inscrito en la clase." };

  const textoNota = String(form.get("nota") ?? "").trim().replace(",", ".");
  const retro = String(form.get("retroalimentacion") ?? "").trim();
  const max = Number(datos.tarea.puntaje_max);

  let nota: number | null = null;
  if (textoNota) {
    nota = Number(textoNota);
    if (!Number.isFinite(nota) || nota < 0 || nota > max) return { error: `La nota debe estar entre 0 y ${max}.` };
    nota = Math.round(nota * 100) / 100;
  }
  if (retro.length > 2000) return { error: "La retroalimentación es demasiado larga." };

  const { error } = await supabaseServer()
    .from("entregas")
    .upsert(
      {
        tarea_id: tareaId,
        estudiante_usuario: estudiante,
        nota,
        retroalimentacion: retro || null,
        calificada_at: nota === null ? null : new Date().toISOString(),
      },
      { onConflict: "tarea_id,estudiante_usuario" },
    );
  if (error) return { error: error.message };

  revalidatePath(`/maestro/tarea/${tareaId}`);
  revalidatePath(`/maestro/clase/${datos.clase.id}/calificaciones`);
  return ok(nota === null ? "Calificación borrada." : "Guardado.");
}

// ---------- Apariencia de la clase ----------

// El maestro solo puede cambiar el icono y el color de SUS clases. Nombre, grado,
// horario, aula y maestro asignado los maneja la administracion.
export async function personalizarClase(claseId: string, _prev: EstadoForm, form: FormData): Promise<EstadoForm> {
  const u = await requerirRol("maestro");
  const clase = await claseDeUsuario(u, claseId);
  if (!clase) return { error: "Clase no encontrada." };

  const icono = String(form.get("icono") ?? "");
  const tema = String(form.get("tema") ?? "");
  if (icono && !(icono in ICONOS)) return { error: "Icono inválido." };
  if (tema && !(tema in TEMAS)) return { error: "Color inválido." };

  const { error } = await supabaseServer()
    .from("clases")
    .update({ icono: icono || null, tema: tema || null })
    .eq("id", clase.id);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return ok("Apariencia guardada.");
}

// ---------- Semanas ----------

function datosSemana(form: FormData) {
  const texto = (campo: string) => String(form.get(campo) ?? "").trim();
  const fecha = texto("fecha_inicio");
  return {
    titulo: texto("titulo").slice(0, 160) || null,
    descripcion: texto("descripcion").slice(0, 600) || null,
    fecha_inicio: /^\d{4}-\d{2}-\d{2}$/.test(fecha) ? lunesDe(fecha) : null,
  };
}

export async function crearSemana(claseId: string, _prev: EstadoForm, form: FormData): Promise<EstadoForm> {
  const u = await requerirRol("maestro");
  const clase = await claseDeUsuario(u, claseId);
  if (!clase) return { error: "Clase no encontrada." };

  const numero = Number(form.get("numero"));
  if (!Number.isInteger(numero) || numero < 1 || numero > 60) return { error: "El número de semana debe estar entre 1 y 60." };

  const { error } = await supabaseServer()
    .from("semanas")
    .insert({ clase_id: clase.id, numero, ...datosSemana(form) });
  if (error) return { error: error.code === "23505" ? `Ya existe la semana ${numero}.` : error.message };

  revalidatePath(`/maestro/clase/${clase.id}`);
  return ok(`Semana ${numero} creada.`);
}

export async function editarSemana(semanaId: string, _prev: EstadoForm, form: FormData): Promise<EstadoForm> {
  const u = await requerirRol("maestro");
  const semana = await semanaDeMaestro(u, semanaId);
  if (!semana) return { error: "Semana no encontrada." };

  const cambios: Record<string, string | null> = datosSemana(form);
  const banner = form.get("portada");
  if (banner instanceof File && banner.size > 0) {
    const subida = await subirImagen(`clases/${semana.clase_id}/semanas/${semana.id}`, banner);
    if ("error" in subida) return { error: subida.error };
    cambios.portada_path = subida.path;
  } else if (form.get("quitar_portada") === "on") {
    cambios.portada_path = null;
  }

  const supabase = supabaseServer();
  const { error } = await supabase.from("semanas").update(cambios).eq("id", semana.id);
  if (error) return { error: error.message };
  if ("portada_path" in cambios && semana.portada_path) {
    await supabase.storage.from(BUCKET_MATERIALES).remove([semana.portada_path]);
  }

  revalidatePath(`/maestro/clase/${semana.clase_id}`);
  return ok("Semana actualizada.");
}

// Borra la semana; sus modulos no se borran, quedan "sin semana".
export async function borrarSemana(semanaId: string, _prev: EstadoForm, _form: FormData): Promise<EstadoForm> {
  const u = await requerirRol("maestro");
  const semana = await semanaDeMaestro(u, semanaId);
  if (!semana) return { error: "Semana no encontrada." };

  const supabase = supabaseServer();
  const { error } = await supabase.from("semanas").delete().eq("id", semana.id);
  if (error) return { error: error.message };
  if (semana.portada_path) await supabase.storage.from(BUCKET_MATERIALES).remove([semana.portada_path]);

  revalidatePath(`/maestro/clase/${semana.clase_id}`);
  return ok(`Semana ${semana.numero} borrada.`);
}
