"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verificarClave } from "@/lib/claves";
import { COOKIE_SESION, rutaInicio } from "@/lib/sesion";
import { supabaseServer } from "@/lib/supabase/server";
import type { Rol } from "@/lib/tipos";

export interface EstadoLogin {
  error?: string;
}

export async function iniciarSesion(_prev: EstadoLogin, form: FormData): Promise<EstadoLogin> {
  const usuario = String(form.get("usuario") ?? "").trim().toLowerCase();
  const clave = String(form.get("clave") ?? "");

  const { data } = await supabaseServer()
    .from("usuarios")
    .select("usuario, rol, clave_hash")
    .eq("usuario", usuario)
    .maybeSingle();

  if (!data || !(await verificarClave(clave, data.clave_hash))) {
    return { error: "Usuario o clave incorrectos." };
  }

  (await cookies()).set(COOKIE_SESION, data.usuario, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  redirect(rutaInicio(data.rol as Rol));
}

export async function cerrarSesion() {
  (await cookies()).delete(COOKIE_SESION);
  redirect("/login");
}
