import { Clock, MapPin, UserRound } from "lucide-react";
import { estiloClase } from "@/lib/materias";
import type { Clase } from "@/lib/tipos";

// Cabecera grande de una clase con el color e icono de su materia.
export default function CabeceraClase({
  clase,
  maestro,
  acciones,
  children,
}: {
  clase: Clase;
  maestro?: string | null;
  acciones?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const { Icono, degradado } = estiloClase(clase);
  return (
    <div className={`relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br ${degradado} p-6 text-white shadow-elevada sm:p-8`}>
      <div className="patron-puntos pointer-events-none absolute inset-0" />
      <Icono className="pointer-events-none absolute -right-6 -bottom-8 h-48 w-48 text-white/10" />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/25">
            <Icono className="h-7 w-7" />
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-white/75">{clase.grado}</p>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{clase.nombre}</h1>
            {clase.descripcion && <p className="mt-1 max-w-2xl text-white/85">{clase.descripcion}</p>}
          </div>
        </div>
        {acciones && <div className="flex flex-wrap gap-2">{acciones}</div>}
      </div>
      <div className="relative mt-5 flex flex-wrap gap-2 text-sm">
        {maestro !== undefined && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/20">
            <UserRound className="h-4 w-4" /> {maestro ?? "Sin maestro asignado"}
          </span>
        )}
        {clase.horario && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/20">
            <Clock className="h-4 w-4" /> {clase.horario}
          </span>
        )}
        {clase.aula && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/20">
            <MapPin className="h-4 w-4" /> {clase.aula}
          </span>
        )}
        {children}
      </div>
    </div>
  );
}
