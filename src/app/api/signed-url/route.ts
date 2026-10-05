import { NextResponse, type NextRequest } from "next/server";
import { recursoVisible } from "@/lib/acceso";
import { obtenerSesion } from "@/lib/sesion";
import { BUCKET_MATERIALES, supabaseServer } from "@/lib/supabase/server";

const SEGUNDOS_VALIDEZ = 300;

// GET /api/signed-url?recurso=<id>
// Verifica que el usuario pueda ver el recurso y redirige a una signed URL temporal.
// Con &formato=json devuelve { url } en lugar de redirigir.
export async function GET(req: NextRequest) {
  const u = await obtenerSesion();
  if (!u) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const recursoId = req.nextUrl.searchParams.get("recurso") ?? "";
  const recurso = await recursoVisible(u, recursoId);
  if (!recurso?.storage_path) {
    return NextResponse.json({ error: "Recurso no encontrado." }, { status: 404 });
  }

  const { data, error } = await supabaseServer()
    .storage.from(BUCKET_MATERIALES)
    .createSignedUrl(recurso.storage_path, SEGUNDOS_VALIDEZ);
  if (error || !data) {
    return NextResponse.json({ error: "No se pudo generar el enlace del archivo." }, { status: 500 });
  }

  if (req.nextUrl.searchParams.get("formato") === "json") {
    return NextResponse.json({ url: data.signedUrl, expira_en: SEGUNDOS_VALIDEZ });
  }
  return NextResponse.redirect(data.signedUrl);
}
