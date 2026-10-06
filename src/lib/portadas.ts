import "server-only";
import { BUCKET_MATERIALES, supabaseServer } from "./supabase/server";
import type { Modulo } from "./tipos";

// Firma de una vez las portadas de varios modulos (el bucket es privado).
export async function urlsPortadas(modulos: Pick<Modulo, "id" | "portada_path">[]): Promise<Map<string, string>> {
  const conPortada = modulos.filter((m) => m.portada_path);
  const urls = new Map<string, string>();
  if (conPortada.length === 0) return urls;

  const { data } = await supabaseServer()
    .storage.from(BUCKET_MATERIALES)
    .createSignedUrls(
      conPortada.map((m) => m.portada_path as string),
      60 * 60,
    );
  conPortada.forEach((m, i) => {
    const url = data?.[i]?.signedUrl;
    if (url) urls.set(m.id, url);
  });
  return urls;
}
