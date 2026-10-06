import { CalendarDays } from "lucide-react";
import type { EstiloMateria } from "@/lib/materias";
import { estadoSemana, rangoSemana } from "@/lib/semanas";
import type { Semana } from "@/lib/tipos";

const ESTADO = {
  actual: { texto: "Semana actual", clase: "bg-amber-400 text-amber-950" },
  proxima: { texto: "Próxima", clase: "bg-white/20 text-white ring-1 ring-white/30" },
  pasada: { texto: "Finalizada", clase: "bg-black/25 text-white/90" },
  "sin-fecha": { texto: "", clase: "" },
};

// Banner a lo ancho de cada semana: imagen elegida por el maestro o el color de la clase.
export default function SemanaBanner({
  semana,
  portadaUrl,
  estilo,
  acciones,
}: {
  semana: Semana;
  portadaUrl?: string;
  estilo: EstiloMateria;
  acciones?: React.ReactNode;
}) {
  const estado = estadoSemana(semana.fecha_inicio);
  const e = ESTADO[estado];
  return (
    <div className={`relative h-40 overflow-hidden bg-gradient-to-br sm:h-48 ${estilo.degradado}`}>
      {portadaUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={portadaUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <>
          <div className="patron-puntos absolute inset-0" />
          <estilo.Icono className="absolute -right-4 -bottom-6 h-44 w-44 text-white/10" />
        </>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="relative flex h-full flex-col justify-between p-5 text-white">
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-extrabold uppercase tracking-wider text-slate-900">
            Semana {semana.numero}
          </span>
          <div className="flex items-center gap-2">
            {e.texto && <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${e.clase}`}>{e.texto}</span>}
            {acciones}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight drop-shadow-sm sm:text-3xl">
            {semana.titulo || `Semana ${semana.numero}`}
          </h2>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-white/90">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" /> {rangoSemana(semana.fecha_inicio)}
            </span>
            {semana.descripcion && <span className="line-clamp-1">{semana.descripcion}</span>}
          </p>
        </div>
      </div>
    </div>
  );
}
