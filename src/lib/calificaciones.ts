import type { Entrega, Tarea } from "./tipos";

// Utilidades de calificacion. El promedio se expresa sobre 10: cada nota se convierte
// a su proporcion del puntaje maximo de la tarea y se promedian solo las calificadas.

export function sobreDiez(nota: number, puntajeMax: number): number {
  return (Number(nota) / Number(puntajeMax)) * 10;
}

export function promedio(tareas: Tarea[], entregas: Pick<Entrega, "tarea_id" | "nota">[]): number | null {
  const maximos = new Map(tareas.map((t) => [t.id, Number(t.puntaje_max)]));
  const valores = entregas
    .filter((e) => e.nota !== null && maximos.has(e.tarea_id))
    .map((e) => sobreDiez(e.nota as number, maximos.get(e.tarea_id) as number));
  if (valores.length === 0) return null;
  return valores.reduce((a, b) => a + b, 0) / valores.length;
}

export function formatoNota(n: number | null | undefined): string {
  if (n === null || n === undefined) return "-";
  return Number(n).toLocaleString("es", { maximumFractionDigits: 2 });
}

export function formatoFecha(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("es", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Tegucigalpa",
  });
}

export function estaVencida(t: Pick<Tarea, "fecha_entrega">, ahora = Date.now()): boolean {
  return !!t.fecha_entrega && new Date(t.fecha_entrega).getTime() < ahora;
}

export function entregadaTarde(t: Pick<Tarea, "fecha_entrega">, e: Pick<Entrega, "entregada_at">): boolean {
  return !!t.fecha_entrega && !!e.entregada_at && new Date(e.entregada_at) > new Date(t.fecha_entrega);
}
