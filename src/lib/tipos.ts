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
  descripcion: string | null;
  horario: string | null;
  aula: string | null;
  icono: string | null;
  tema: string | null;
}

export interface Modulo {
  id: string;
  clase_id: string;
  titulo: string;
  descripcion: string | null;
  orden: number;
  publicado: boolean;
  color: ColorModulo;
  portada_path: string | null;
  semana_id: string | null;
}

export interface Semana {
  id: string;
  clase_id: string;
  numero: number;
  titulo: string | null;
  descripcion: string | null;
  fecha_inicio: string | null;
  portada_path: string | null;
}

export type ColorModulo = "azul" | "verde" | "rojo" | "naranja" | "morado" | "rosa" | "turquesa" | "gris";

export interface Tarea {
  id: string;
  modulo_id: string;
  titulo: string;
  instrucciones: string | null;
  fecha_entrega: string | null;
  puntaje_max: number;
  created_at: string;
}

export interface Entrega {
  id: string;
  tarea_id: string;
  estudiante_usuario: string;
  comentario: string | null;
  storage_path: string | null;
  nombre_archivo: string | null;
  entregada_at: string | null;
  nota: number | null;
  retroalimentacion: string | null;
  calificada_at: string | null;
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
