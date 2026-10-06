import { Award, CalendarClock, CircleCheck, CircleAlert, Clock, FileText, Hourglass, NotebookPen, Send } from "lucide-react";
import { entregadaTarde, estaVencida, formatoFecha, formatoNota } from "@/lib/calificaciones";
import type { Entrega, Tarea } from "@/lib/tipos";
import FormEntrega from "./FormEntrega";

// Tarea vista por el alumno: instrucciones, estado de su entrega, nota y formulario.
export default function TareaAlumno({ tarea, entrega }: { tarea: Tarea; entrega?: Entrega }) {
  const calificada = entrega?.nota !== null && entrega?.nota !== undefined;
  const entregada = !!entrega?.entregada_at;
  const vencida = estaVencida(tarea);

  let estado: { texto: string; clase: string; Icono: typeof CircleCheck };
  if (calificada) estado = { texto: "Calificada", clase: "bg-bosque-50 text-bosque-700", Icono: Award };
  else if (entregada) {
    estado = entregadaTarde(tarea, entrega!)
      ? { texto: "Entregada tarde", clase: "bg-amber-50 text-amber-800", Icono: Clock }
      : { texto: "Entregada", clase: "bg-marca-50 text-marca-700", Icono: CircleCheck };
  } else if (vencida) estado = { texto: "Sin entregar - vencida", clase: "bg-red-50 text-red-700", Icono: CircleAlert };
  else estado = { texto: "Pendiente", clase: "bg-slate-100 text-slate-600", Icono: Hourglass };

  return (
    <div className="rounded-2xl border border-marca-100 bg-gradient-to-br from-white to-marca-50/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-marca-700 text-white">
            <NotebookPen className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-marca-700">Tarea</p>
            <p className="font-semibold text-slate-900">{tarea.titulo}</p>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Award className="h-3.5 w-3.5" /> Vale {formatoNota(tarea.puntaje_max)} puntos
              </span>
              {tarea.fecha_entrega && (
                <span className={`inline-flex items-center gap-1 ${vencida && !entregada ? "text-red-600" : ""}`}>
                  <CalendarClock className="h-3.5 w-3.5" /> {formatoFecha(tarea.fecha_entrega)}
                </span>
              )}
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${estado.clase}`}>
          <estado.Icono className="h-3.5 w-3.5" />
          {estado.texto}
        </span>
      </div>

      {tarea.instrucciones && <p className="mt-3 whitespace-pre-line text-sm text-slate-700">{tarea.instrucciones}</p>}

      {entregada && (
        <div className="mt-3 rounded-xl bg-white p-3 text-sm ring-1 ring-slate-200">
          <p className="text-xs font-semibold text-slate-500">Tu entrega - {formatoFecha(entrega!.entregada_at)}</p>
          {entrega!.storage_path && (
            <a
              href={`/api/signed-url?entrega=${entrega!.id}`}
              target="_blank"
              rel="noopener"
              className="mt-1 inline-flex items-center gap-1.5 font-medium text-marca-700 hover:underline"
            >
              <FileText className="h-4 w-4" />
              {entrega!.nombre_archivo ?? "Ver archivo"}
            </a>
          )}
          {entrega!.comentario && <p className="mt-1 whitespace-pre-line text-slate-700">{entrega!.comentario}</p>}
        </div>
      )}

      {calificada ? (
        <div className="mt-3 flex items-start gap-3 rounded-xl border border-bosque-200 bg-bosque-50 p-3 text-sm">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-bosque-700 text-lg font-extrabold text-white">
            {formatoNota(entrega!.nota)}
          </span>
          <div>
            <p className="font-semibold text-bosque-800">
              Nota: {formatoNota(entrega!.nota)} / {formatoNota(tarea.puntaje_max)}
            </p>
            {entrega!.retroalimentacion && (
              <p className="mt-0.5 whitespace-pre-line text-bosque-900">{entrega!.retroalimentacion}</p>
            )}
          </div>
        </div>
      ) : (
        <details className="group mt-3" open={!entregada}>
          <summary className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-marca-700">
            <Send className="h-4 w-4" />
            {entregada ? "Cambiar mi entrega" : "Entregar"}
          </summary>
          <div className="mt-3">
            <FormEntrega tareaId={tarea.id} yaEntregada={entregada} />
          </div>
        </details>
      )}
    </div>
  );
}
