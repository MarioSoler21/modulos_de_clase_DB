// Tipos de las tablas de Supabase.

export type Rol = "admin" | "maestro" | "estudiante";

// Usuario sin clave_hash: es lo que circula por la app.
export interface Usuario {
  usuario: string;
  nombre: string;
  rol: Rol;
  grado: string | null;
}

export type TipoRecurso = "pdf" | "doc" | "excel" | "imagen" | "video" | "enlace" | "anuncio";

export const TIPOS_DOCUMENTO: TipoRecurso[] = ["pdf", "doc", "excel", "imagen"];

export interface Clase {
  id: string;
  nombre: string;
  grado: string;
  maestro_usuario: string | null;
}

export interface Modulo {
  id: string;
  clase_id: string;
  titulo: string;
  descripcion: string | null;
  orden: number;
  publicado: boolean;
}

export interface Recurso {
  id: string;
  modulo_id: string;
  tipo: TipoRecurso;
  titulo: string;
  storage_path: string | null;
  video_url: string | null;
  created_at: string;
}
