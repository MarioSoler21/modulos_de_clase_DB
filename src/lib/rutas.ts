import type { Rol } from "./tipos";

export function rutaInicio(rol: Rol): string {
  return rol === "admin" ? "/admin" : rol === "maestro" ? "/maestro" : "/estudiante";
}
