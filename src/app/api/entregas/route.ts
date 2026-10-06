import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { tareaDeEstudiante } from "@/lib/acceso";
import { MAX_BYTES, contentTypeDe, nombreSeguro } from "@/lib/recursos";
import { obtenerSesion } from "@/lib/sesion";
import { BUCKET_MATERIALES, supabaseServer } from "@/lib/supabase/server";

function error(mensaje: string, status = 400) {
  return NextResponse.json({ error: mensaje }, { status });
}

// POST /api/entregas (multipart/form-data)
// Campos: tarea_id, comentario (opcional), archivo (opcional). Al menos uno de los dos.
// El alumno puede volver a entregar mientras la tarea no este calificada.
export async function POST(req: Request) {
  const u = await obtenerSesion();
  if (!u || u.rol !== "estudiante") return error("No autorizado.", 401);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return error("Formulario inválido.");
  }

  const tarea = await tareaDeEstudiante(u, String(form.get("tarea_id") ?? ""));
  if (!tarea) return error("Tarea no encontrada.", 404);

  const comentario = String(form.get("comentario") ?? "").trim();
  const archivo = form.get("archivo");
  const hayArchivo = archivo instanceof File && archivo.size > 0;

  if (!comentario && !hayArchivo) return error("Escribe un comentario o adjunta un archivo.");
  if (comentario.length > 2000) return error("El comentario es demasiado largo (máximo 2000 caracteres).");

  const supabase = supabaseServer();
  const { data: previa } = await supabase
    .from("entregas")
    .select("id, nota, storage_path, nombre_archivo")
    .eq("tarea_id", tarea.id)
    .eq("estudiante_usuario", u.usuario)
    .maybeSingle();
  if (previa?.nota !== null && previa?.nota !== undefined) {
    return error("Esta tarea ya fue calificada; no se puede volver a entregar.", 409);
  }

  let storagePath: string | null = previa?.storage_path ?? null;
  let nombreArchivo: string | null = previa?.nombre_archivo ?? null;

  if (hayArchivo) {
    if (archivo.size > MAX_BYTES) return error("El archivo supera el límite de 10MB.");
    const contentType = contentTypeDe(archivo.name);
    if (!contentType) return error("Formato no permitido. Usa PDF, Word, Excel o imagen.");

    const nuevoPath = `clases/${tarea.clase_id}/entregas/${tarea.id}/${u.usuario}/${randomUUID()}-${nombreSeguro(archivo.name)}`;
    const { error: errSubida } = await supabase.storage
      .from(BUCKET_MATERIALES)
      .upload(nuevoPath, archivo, { contentType, upsert: false });
    if (errSubida) return error(`No se pudo subir el archivo: ${errSubida.message}`, 500);

    if (storagePath) await supabase.storage.from(BUCKET_MATERIALES).remove([storagePath]);
    storagePath = nuevoPath;
    nombreArchivo = archivo.name.slice(0, 200);
  }

  const { data, error: errGuardar } = await supabase
    .from("entregas")
    .upsert(
      {
        tarea_id: tarea.id,
        estudiante_usuario: u.usuario,
        comentario: comentario || null,
        storage_path: storagePath,
        nombre_archivo: nombreArchivo,
        entregada_at: new Date().toISOString(),
      },
      { onConflict: "tarea_id,estudiante_usuario" },
    )
    .select()
    .single();
  if (errGuardar) return error(`No se pudo guardar la entrega: ${errGuardar.message}`, 500);

  return NextResponse.json({ entrega: data }, { status: 201 });
}
