import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { supabaseServer } from "./supabase/server";
import { rutaInicio } from "./rutas";
import type { Rol, Usuario } from "./tipos";

export { rutaInicio };

// Sesion simple: la cookie guarda solo el nombre de usuario. El rol, nombre y grado
// se leen de la tabla "usuarios" en cada request, asi que un usuario borrado o
// modificado por el admin pierde o cambia su acceso de inmediato.

export const COOKIE_SESION = "sesion_usuario";

export const COLUMNAS_USUARIO = "usuario, nombre, rol, grado";

export const buscarUsuario = cache(async (usuario: string): Promise<Usuario | null> => {
  const { data, error } = await supabaseServer()
    .from("usuarios")
    .select(COLUMNAS_USUARIO)
    .eq("usuario", usuario)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Usuario | null;
});

export async function obtenerSesion(): Promise<Usuario | null> {
  const valor = (await cookies()).get(COOKIE_SESION)?.value;
  return valor ? buscarUsuario(valor) : null;
}

export async function requerirRol(rol: Rol): Promise<Usuario> {
  const u = await obtenerSesion();
  if (!u) redirect("/login");
  if (u.rol !== rol) redirect(rutaInicio(u.rol));
  return u;
}

