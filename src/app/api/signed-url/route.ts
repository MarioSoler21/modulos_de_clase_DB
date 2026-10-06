import { NextResponse, type NextRequest } from "next/server";
import { entregaVisible, recursoVisible } from "@/lib/acceso";
import { obtenerSesion } from "@/lib/sesion";
import { BUCKET_MATERIALES, supabaseServer } from "@/lib/supabase/server";

const SEGUNDOS_VALIDEZ = 300;

// GET /api/signed-url?recurso=<id>   material de un modulo
// GET /api/signed-url?entrega=<id>   archivo entregado por un alumno
// Verifica que el usuario pueda ver el archivo y redirige a una signed URL temporal.
// Con &formato=json devuelve { url } en lugar de redirigir.
export async function GET(req: NextRequest) {
  const u = await obtenerSesion();
  if (!u) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const params = req.nextUrl.searchParams;
  let path: string | null = null;
  let descarga: string | undefined;

  if (params.get("entrega")) {
    const entrega = await entregaVisible(u, params.get("entrega") ?? "");
    path = entrega?.storage_path ?? null;
    descarga = entrega?.nombre_archivo ?? undefined;
  } else {
    const recurso = await recursoVisible(u, params.get("recurso") ?? "");
    path = recurso?.storage_path ?? null;
  }
  if (!path) return NextResponse.json({ error: "Archivo no encontrado." }, { status: 404 });

  const { data, error } = await supabaseServer()
    .storage.from(BUCKET_MATERIALES)
    .createSignedUrl(path, SEGUNDOS_VALIDEZ, descarga && !/\.(pdf|png|jpe?g|gif|webp)$/i.test(descarga) ? { download: descarga } : undefined);
  if (error || !data) {
    return NextResponse.json({ error: "No se pudo generar el enlace del archivo." }, { status: 500 });
  }

  if (params.get("formato") === "json") {
    return NextResponse.json({ url: data.signedUrl, expira_en: SEGUNDOS_VALIDEZ });
  }
  return NextResponse.redirect(data.signedUrl);
}
