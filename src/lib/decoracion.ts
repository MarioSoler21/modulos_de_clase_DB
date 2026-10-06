import type { ColorModulo } from "./tipos";

// Paleta de colores de los modulos. Las clases estan escritas completas para que
// Tailwind las detecte.
export const COLORES: Record<ColorModulo, { nombre: string; banda: string; suave: string; texto: string }> = {
  azul: { nombre: "Azul", banda: "bg-blue-600", suave: "bg-blue-50", texto: "text-blue-800" },
  verde: { nombre: "Verde", banda: "bg-green-600", suave: "bg-green-50", texto: "text-green-800" },
  rojo: { nombre: "Rojo", banda: "bg-red-600", suave: "bg-red-50", texto: "text-red-800" },
  naranja: { nombre: "Naranja", banda: "bg-orange-500", suave: "bg-orange-50", texto: "text-orange-800" },
  morado: { nombre: "Morado", banda: "bg-purple-600", suave: "bg-purple-50", texto: "text-purple-800" },
  rosa: { nombre: "Rosa", banda: "bg-pink-500", suave: "bg-pink-50", texto: "text-pink-800" },
  turquesa: { nombre: "Turquesa", banda: "bg-teal-500", suave: "bg-teal-50", texto: "text-teal-800" },
  gris: { nombre: "Gris", banda: "bg-slate-500", suave: "bg-slate-100", texto: "text-slate-800" },
};

export const LISTA_COLORES = Object.keys(COLORES) as ColorModulo[];

export function colorDe(c: string | null | undefined) {
  return COLORES[(c ?? "azul") as ColorModulo] ?? COLORES.azul;
}
