import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { moduloDeMaestro } from "@/lib/acceso";
import { EXTENSIONES, MAX_BYTES, esDocumento, esUrlValida, extension, nombreSeguro } from "@/lib/recursos";
import { obtenerSesion } from "@/lib/sesion";
import { BUCKET_MATERIALES, supabaseServer } from "@/lib/supabase/server";
import type { TipoRecurso } from "@/lib/tipos";

const TIPOS: TipoRecurso[] = ["pdf", "doc", "excel", "imagen", "video", "enlace", "anuncio"];

function error(mensaje: string, status = 400) {
  return NextResponse.json({ error: mensaje }, { status });
}

// POST /api/recursos (multipart/form-data)
// Campos: modulo_id, tipo, titulo, y segun el tipo: archivo (documentos) o url (video/enlace).
export async function POST(req: Request) {
  const u = await obtenerSesion();
  if (!u || u.rol !== "maestro") return error("No autorizado.", 401);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return error("Formulario inválido.");
  }

  const moduloId = String(form.get("modulo_id") ?? "");
  const tipo = String(form.get("tipo") ?? "") as TipoRecurso;
  const titulo = String(form.get("titulo") ?? "").trim();

  if (!TIPOS.includes(tipo)) return error("Tipo de recurso inválido.");
  if (!titulo) return error("El título es obligatorio.");
  if (titulo.length > 500) return error("El título es demasiado largo.");

  const modulo = await moduloDeMaestro(u, moduloId);
  if (!modulo) return error("Módulo no encontrado.", 404);

  const supabase = supabaseServer();
  let storagePath: string | null = null;
  let videoUrl: string | null = null;

  if (esDocumento(tipo)) {
    // Documentos: se suben al bucket privado.
    const archivo = form.get("archivo");
    if (!(archivo instanceof File) || archivo.size === 0) return error("Selecciona un archivo.");
    if (archivo.size > MAX_BYTES) return error("El archivo supera el límite de 10MB.");

    const ext = extension(archivo.name);
    const contentType = EXTENSIONES[tipo]?.[ext];
    if (!contentType) {
      const permitidas = Object.keys(EXTENSIONES[tipo] ?? {}).join(", ");
      return error(`Para el tipo seleccionado solo se aceptan archivos: ${permitidas}.`);
    }

    storagePath = `clases/${modulo.clase_id}/${modulo.id}/${randomUUID()}-${nombreSeguro(archivo.name)}`;
    const { error: errSubida } = await supabase.storage
      .from(BUCKET_MATERIALES)
      .upload(storagePath, archivo, { contentType, upsert: false });
    if (errSubida) return error(`No se pudo subir el archivo: ${errSubida.message}`, 500);
  } else if (tipo === "video" || tipo === "enlace") {
    // Video y enlace: solo se guarda la URL, nunca se sube un archivo.
    const url = String(form.get("url") ?? "").trim();
    if (!esUrlValida(url)) return error("Ingresa una URL válida (http o https).");
    videoUrl = url;
  }
  // Anuncio: solo el texto del titulo.

  const { data, error: errInsert } = await supabase
    .from("recursos")
    .insert({ modulo_id: modulo.id, tipo, titulo, storage_path: storagePath, video_url: videoUrl })
    .select()
    .single();

  if (errInsert) {
    if (storagePath) await supabase.storage.from(BUCKET_MATERIALES).remove([storagePath]);
    return error(`No se pudo guardar el recurso: ${errInsert.message}`, 500);
  }

  return NextResponse.json({ recurso: data }, { status: 201 });
}
