"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hashClave } from "@/lib/claves";
import type { EstadoForm } from "@/lib/formulario";
import { esUuid } from "@/lib/recursos";
import { buscarUsuario, requerirRol } from "@/lib/sesion";
import { BUCKET_MATERIALES, supabaseServer } from "@/lib/supabase/server";
import type { Rol } from "@/lib/tipos";

// Acciones exclusivas del administrador. Cada una vuelve a verificar el rol.

const ROLES: Rol[] = ["admin", "maestro", "estudiante"];
const CLAVE_MINIMA = 6;

const texto = (form: FormData, campo: string) => String(form.get(campo) ?? "").trim();
const ok = (mensaje: string): EstadoForm => ({ ok: Date.now(), mensaje });

function revalidarAdmin() {
  revalidatePath("/admin", "layout");
}

// ---------- Usuarios ----------

export async function crearUsuario(_prev: EstadoForm, form: FormData): Promise<EstadoForm> {
  await requerirRol("admin");
  const usuario = texto(form, "usuario").toLowerCase();
  const nombre = texto(form, "nombre");
  const rol = texto(form, "rol") as Rol;
  const grado = texto(form, "grado");
  const clave = String(form.get("clave") ?? "");

  if (!/^[a-z0-9._-]{3,40}$/.test(usuario)) {
    return { error: "El usuario debe tener 3 a 40 caracteres: letras minúsculas, números, punto o guion." };
  }
  if (!nombre) return { error: "El nombre es obligatorio." };
  if (!ROLES.includes(rol)) return { error: "Rol inválido." };
  if (rol === "estudiante" && !grado) return { error: "El grado es obligatorio para estudiantes." };
  if (clave.length < CLAVE_MINIMA) return { error: `La clave debe tener al menos ${CLAVE_MINIMA} caracteres.` };

  const { error } = await supabaseServer()
    .from("usuarios")
    .insert({ usuario, nombre, rol, grado: rol === "estudiante" ? grado : null, clave_hash: await hashClave(clave) });
  if (error) {
    return { error: error.code === "23505" ? `El usuario "${usuario}" ya existe.` : error.message };
  }

  revalidarAdmin();
  return ok(`Usuario "${usuario}" creado.`);
}

export async function editarUsuario(usuario: string, _prev: EstadoForm, form: FormData): Promise<EstadoForm> {
  await requerirRol("admin");
  const actual = await buscarUsuario(usuario);
  if (!actual) return { error: "Usuario no encontrado." };

  const nombre = texto(form, "nombre");
  const grado = texto(form, "grado");
  const clave = String(form.get("clave") ?? "");

  if (!nombre) return { error: "El nombre es obligatorio." };
  if (actual.rol === "estudiante" && !grado) return { error: "El grado es obligatorio para estudiantes." };
  if (clave && clave.length < CLAVE_MINIMA) {
    return { error: `La clave debe tener al menos ${CLAVE_MINIMA} caracteres.` };
  }

  const cambios: Record<string, string | null> = {
    nombre,
    grado: actual.rol === "estudiante" ? grado : null,
  };
  if (clave) cambios.clave_hash = await hashClave(clave);

  const { error } = await supabaseServer().from("usuarios").update(cambios).eq("usuario", usuario);
  if (error) return { error: error.message };

  revalidarAdmin();
  return ok(clave ? "Cambios guardados. La clave fue actualizada." : "Cambios guardados.");
}

export async function borrarUsuario(usuario: string, _prev: EstadoForm, _form: FormData): Promise<EstadoForm> {
  const admin = await requerirRol("admin");
  if (usuario === admin.usuario) return { error: "No puedes borrar tu propia cuenta." };

  const objetivo = await buscarUsuario(usuario);
  if (!objetivo) return { error: "Usuario no encontrado." };

  // Las entregas se borran en cascada; antes se quitan sus archivos de Storage.
  const { data: entregas } = await supabaseServer()
    .from("entregas")
    .select("storage_path")
    .eq("estudiante_usuario", usuario)
    .not("storage_path", "is", null);
  const paths = (entregas ?? []).map((e) => e.storage_path as string);
  if (paths.length) await supabaseServer().storage.from(BUCKET_MATERIALES).remove(paths);

  const { error } = await supabaseServer().from("usuarios").delete().eq("usuario", usuario);
  if (error) return { error: error.message };

  revalidarAdmin();
  redirect(`/admin/usuarios?rol=${objetivo.rol}`);
}

// ---------- Clases ----------

async function validarMaestro(maestro: string): Promise<string | null> {
  if (!maestro) return null;
  const u = await buscarUsuario(maestro);
  if (!u || u.rol !== "maestro") throw new Error("El maestro seleccionado no existe.");
  return maestro;
}

function datosClase(form: FormData) {
  const opcional = (campo: string) => texto(form, campo).slice(0, 300) || null;
  return {
    nombre: texto(form, "nombre"),
    grado: texto(form, "grado"),
    maestro: texto(form, "maestro_usuario"),
    extra: { descripcion: opcional("descripcion"), horario: opcional("horario"), aula: opcional("aula") },
  };
}

export async function crearClase(_prev: EstadoForm, form: FormData): Promise<EstadoForm> {
  await requerirRol("admin");
  const { nombre, grado, maestro, extra } = datosClase(form);
  if (!nombre || !grado) return { error: "Nombre y grado son obligatorios." };

  let maestroUsuario: string | null;
  try {
    maestroUsuario = await validarMaestro(maestro);
  } catch (e) {
    return { error: (e as Error).message };
  }

  const { data, error } = await supabaseServer()
    .from("clases")
    .insert({ nombre, grado, maestro_usuario: maestroUsuario, ...extra })
    .select("id")
    .single();
  if (error) return { error: error.message };

  revalidarAdmin();
  redirect(`/admin/clases/${data.id}`);
}

export async function editarClase(claseId: string, _prev: EstadoForm, form: FormData): Promise<EstadoForm> {
  await requerirRol("admin");
  if (!esUuid(claseId)) return { error: "Clase no encontrada." };
  const { nombre, grado, maestro, extra } = datosClase(form);
  if (!nombre || !grado) return { error: "Nombre y grado son obligatorios." };

  let maestroUsuario: string | null;
  try {
    maestroUsuario = await validarMaestro(maestro);
  } catch (e) {
    return { error: (e as Error).message };
  }

  const { error } = await supabaseServer()
    .from("clases")
    .update({ nombre, grado, maestro_usuario: maestroUsuario, ...extra })
    .eq("id", claseId);
  if (error) return { error: error.message };

  revalidarAdmin();
  revalidatePath("/maestro", "layout");
  return ok("Clase actualizada.");
}

export async function borrarClase(claseId: string, _prev: EstadoForm, _form: FormData): Promise<EstadoForm> {
  await requerirRol("admin");
  if (!esUuid(claseId)) return { error: "Clase no encontrada." };
  const supabase = supabaseServer();

  // Borra primero los archivos de Storage (material, entregas y portadas); los modulos,
  // recursos, tareas y entregas se borran en cascada.
  const [recursos, entregas, modulos, semanas] = await Promise.all([
    supabase.from("recursos").select("p:storage_path, modulos!inner(clase_id)").eq("modulos.clase_id", claseId),
    supabase.from("entregas").select("p:storage_path, tareas!inner(modulos!inner(clase_id))").eq("tareas.modulos.clase_id", claseId),
    supabase.from("modulos").select("p:portada_path").eq("clase_id", claseId),
    supabase.from("semanas").select("p:portada_path").eq("clase_id", claseId),
  ]);
  const errLectura = recursos.error ?? entregas.error ?? modulos.error ?? semanas.error;
  if (errLectura) return { error: errLectura.message };

  // Los PDFs del seed se comparten entre clases: solo se borran los subidos a esta clase.
  const paths = [...(recursos.data ?? []), ...(entregas.data ?? []), ...(modulos.data ?? []), ...(semanas.data ?? [])]
    .map((f) => f.p as string | null)
    .filter((p): p is string => !!p && p.startsWith(`clases/${claseId}/`));
  if (paths.length) await supabase.storage.from(BUCKET_MATERIALES).remove(paths);

  const { error } = await supabase.from("clases").delete().eq("id", claseId);
  if (error) return { error: error.message };

  revalidarAdmin();
  redirect("/admin/clases");
}

// ---------- Inscripciones ----------

export async function inscribirAlumno(claseId: string, _prev: EstadoForm, form: FormData): Promise<EstadoForm> {
  await requerirRol("admin");
  const estudiante = texto(form, "estudiante_usuario");
  if (!estudiante) return { error: "Selecciona un alumno." };

  const u = await buscarUsuario(estudiante);
  if (!u || u.rol !== "estudiante") return { error: "El alumno seleccionado no existe." };

  const { error } = await supabaseServer()
    .from("inscripciones")
    .insert({ clase_id: claseId, estudiante_usuario: estudiante });
  if (error) return { error: error.code === "23505" ? "Ese alumno ya está inscrito." : error.message };

  revalidarAdmin();
  return ok(`${u.nombre} inscrito.`);
}

export async function inscribirGrado(claseId: string, _prev: EstadoForm, _form: FormData): Promise<EstadoForm> {
  await requerirRol("admin");
  const supabase = supabaseServer();
  const { data: clase } = await supabase.from("clases").select("grado").eq("id", claseId).maybeSingle();
  if (!clase) return { error: "Clase no encontrada." };

  const { data: alumnos, error: errAl } = await supabase
    .from("usuarios")
    .select("usuario")
    .eq("rol", "estudiante")
    .eq("grado", clase.grado);
  if (errAl) return { error: errAl.message };
  if (!alumnos?.length) return { error: `No hay alumnos registrados en ${clase.grado}.` };

  const { data: nuevos, error } = await supabase
    .from("inscripciones")
    .upsert(
      alumnos.map((a) => ({ clase_id: claseId, estudiante_usuario: a.usuario })),
      { onConflict: "clase_id,estudiante_usuario", ignoreDuplicates: true },
    )
    .select("estudiante_usuario");
  if (error) return { error: error.message };

  revalidarAdmin();
  const n = nuevos?.length ?? 0;
  return ok(n ? `${n} alumno(s) de ${clase.grado} inscritos.` : `Todos los alumnos de ${clase.grado} ya estaban inscritos.`);
}

export async function quitarAlumno(
  claseId: string,
  estudiante: string,
  _prev: EstadoForm,
  _form: FormData,
): Promise<EstadoForm> {
  await requerirRol("admin");
  const { error } = await supabaseServer()
    .from("inscripciones")
    .delete()
    .eq("clase_id", claseId)
    .eq("estudiante_usuario", estudiante);
  if (error) return { error: error.message };

  revalidarAdmin();
  return ok("Alumno quitado.");
}

// Inscribe a un alumno en una clase desde su ficha.
export async function inscribirEnClase(estudiante: string, _prev: EstadoForm, form: FormData): Promise<EstadoForm> {
  await requerirRol("admin");
  const u = await buscarUsuario(estudiante);
  if (!u || u.rol !== "estudiante") return { error: "Alumno no encontrado." };
  const claseId = texto(form, "clase_id");
  if (!esUuid(claseId)) return { error: "Selecciona una clase." };

  const { data: clase } = await supabaseServer().from("clases").select("nombre, grado").eq("id", claseId).maybeSingle();
  if (!clase) return { error: "Clase no encontrada." };

  const { error } = await supabaseServer()
    .from("inscripciones")
    .insert({ clase_id: claseId, estudiante_usuario: estudiante });
  if (error) return { error: error.code === "23505" ? "Ya está inscrito en esa clase." : error.message };

  revalidarAdmin();
  return ok(`Inscrito en ${clase.nombre} (${clase.grado}).`);
}

// Inscribe al alumno en todas las clases de su grado.
export async function inscribirEnSuGrado(estudiante: string, _prev: EstadoForm, _form: FormData): Promise<EstadoForm> {
  await requerirRol("admin");
  const u = await buscarUsuario(estudiante);
  if (!u || u.rol !== "estudiante" || !u.grado) return { error: "Alumno no encontrado." };

  const supabase = supabaseServer();
  const { data: clases, error: errClases } = await supabase.from("clases").select("id").eq("grado", u.grado);
  if (errClases) return { error: errClases.message };
  if (!clases?.length) return { error: `No hay clases de ${u.grado}.` };

  const { data: nuevas, error } = await supabase
    .from("inscripciones")
    .upsert(
      clases.map((c) => ({ clase_id: c.id, estudiante_usuario: estudiante })),
      { onConflict: "clase_id,estudiante_usuario", ignoreDuplicates: true },
    )
    .select("clase_id");
  if (error) return { error: error.message };

  revalidarAdmin();
  const n = nuevas?.length ?? 0;
  return ok(n ? `Inscrito en ${n} clase(s) de ${u.grado}.` : `Ya estaba inscrito en todas las clases de ${u.grado}.`);
}

// Asigna una clase al maestro desde su ficha (reemplaza al maestro anterior).
export async function asignarClaseAMaestro(maestro: string, _prev: EstadoForm, form: FormData): Promise<EstadoForm> {
  await requerirRol("admin");
  const u = await buscarUsuario(maestro);
  if (!u || u.rol !== "maestro") return { error: "Maestro no encontrado." };
  const claseId = texto(form, "clase_id");
  if (!esUuid(claseId)) return { error: "Selecciona una clase." };

  const { data, error } = await supabaseServer()
    .from("clases")
    .update({ maestro_usuario: maestro })
    .eq("id", claseId)
    .select("nombre, grado")
    .maybeSingle();
  if (error) return { error: error.message };
  if (!data) return { error: "Clase no encontrada." };

  revalidarAdmin();
  revalidatePath("/maestro", "layout");
  return ok(`${data.nombre} (${data.grado}) asignada a ${u.nombre}.`);
}
