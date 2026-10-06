import Link from "next/link";
import { ChevronRight, Clock, MapPin } from "lucide-react";
import { estiloClase } from "@/lib/materias";
import type { Clase } from "@/lib/tipos";

// Tarjeta de una clase con el color e icono de su materia.
export default function ClaseTarjeta({
  clase,
  href,
  subtitulo,
  children,
}: {
  clase: Clase;
  href: string;
  subtitulo?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const { Icono, degradado } = estiloClase(clase);
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-tarjeta transition duration-200 hover:-translate-y-0.5 hover:shadow-elevada"
    >
      <div className={`relative bg-gradient-to-br ${degradado} px-5 pb-5 pt-4 text-white`}>
        <div className="patron-puntos pointer-events-none absolute inset-0" />
        <div className="relative flex items-start justify-between gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/15 ring-1 ring-white/25">
            <Icono className="h-6 w-6" />
          </span>
          <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold ring-1 ring-white/25">
            {clase.grado}
          </span>
        </div>
        <h3 className="relative mt-4 text-xl font-extrabold tracking-tight">{clase.nombre}</h3>
        {subtitulo && <p className="relative mt-0.5 text-sm text-white/85">{subtitulo}</p>}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        {(clase.horario || clase.aula) && (
          <div className="space-y-1 text-sm text-slate-600">
            {clase.horario && (
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0 text-slate-400" />
                {clase.horario}
              </p>
            )}
            {clase.aula && (
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                {clase.aula}
              </p>
            )}
          </div>
        )}
        {children && <div className="flex flex-wrap gap-2">{children}</div>}
        <span className="mt-auto inline-flex items-center gap-1 pt-1 text-sm font-semibold text-marca-700">
          Entrar a la clase
          <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

const TONOS_CHIP = {
  gris: "bg-slate-100 text-slate-700",
  marca: "bg-marca-50 text-marca-700",
  bosque: "bg-bosque-50 text-bosque-700",
  ambar: "bg-amber-50 text-amber-800",
  rojo: "bg-red-50 text-red-700",
};

export function Chip({
  icono: Icono,
  children,
  tono = "gris",
}: {
  icono?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  tono?: keyof typeof TONOS_CHIP;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold ${TONOS_CHIP[tono]}`}>
      {Icono && <Icono className="h-3.5 w-3.5" />}
      {children}
    </span>
  );
}
