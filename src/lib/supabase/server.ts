import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cliente con service role key. Solo se usa en el servidor (server components,
// server actions y API routes). Las tablas tienen RLS activado sin politicas,
// por lo que la anon key no puede leer ni escribir nada.

export const BUCKET_MATERIALES = "materiales";

let cliente: SupabaseClient | null = null;

export function supabaseServer(): SupabaseClient {
  if (cliente) return cliente;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  }
  cliente = createClient(url, key, { auth: { persistSession: false } });
  return cliente;
}
