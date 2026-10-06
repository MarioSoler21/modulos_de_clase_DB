// Utilidades de semanas. Las fechas de inicio son fechas sin hora (YYYY-MM-DD) y se
// interpretan en hora de Honduras.

const ZONA = "America/Tegucigalpa";
const DIA_MS = 86_400_000;

function aFecha(iso: string): Date {
  // Mediodia UTC para que la zona horaria no cambie el dia.
  return new Date(`${iso}T12:00:00Z`);
}

function aIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function hoyHonduras(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: ZONA, year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(),
  );
}

// Lunes de la semana de una fecha.
export function lunesDe(iso: string): string {
  const d = aFecha(iso);
  const dia = (d.getUTCDay() + 6) % 7; // lunes = 0
  return aIso(new Date(d.getTime() - dia * DIA_MS));
}

export function sumarDias(iso: string, dias: number): string {
  return aIso(new Date(aFecha(iso).getTime() + dias * DIA_MS));
}

// "5 - 9 oct" (lunes a viernes).
export function rangoSemana(inicio: string | null): string {
  if (!inicio) return "Sin fecha";
  const fmt = (iso: string, conMes: boolean) =>
    aFecha(iso).toLocaleDateString("es", {
      day: "numeric",
      ...(conMes ? { month: "short" } : {}),
      timeZone: "UTC",
    });
  const fin = sumarDias(inicio, 4);
  const mismoMes = inicio.slice(0, 7) === fin.slice(0, 7);
  return `${fmt(inicio, !mismoMes)} - ${fmt(fin, true)}`;
}

export type EstadoSemana = "actual" | "pasada" | "proxima" | "sin-fecha";

export function estadoSemana(inicio: string | null, hoy = hoyHonduras()): EstadoSemana {
  if (!inicio) return "sin-fecha";
  if (hoy < inicio) return "proxima";
  return hoy < sumarDias(inicio, 7) ? "actual" : "pasada";
}
