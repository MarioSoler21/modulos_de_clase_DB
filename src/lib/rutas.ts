import type { Rol } from "./tipos";

export function rutaInicio(rol: Rol): string {
  return rol === "admin" ? "/admin/clases" : rol === "maestro" ? "/maestro" : "/estudiante";
}
