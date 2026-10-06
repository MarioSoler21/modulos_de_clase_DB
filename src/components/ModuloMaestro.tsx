import Link from "next/link";
import { CalendarClock, ChevronRight, Eye, EyeOff, NotebookPen, Paintbrush, UploadCloud } from "lucide-react";
import { alternarPublicado, crearTarea, decorarModulo } from "@/app/maestro/clase/[id]/actions";
import FormAccion from "@/components/FormAccion";
import FormRecurso from "@/components/FormRecurso";
import ModuloEncabezado from "@/components/ModuloEncabezado";
import RecursoItem from "@/components/RecursoItem";
import SubidaArchivos from "@/components/SubidaArchivos";
import type { ModuloConRecursos } from "@/lib/acceso";
import { estaVencida, formatoFecha, formatoNota } from "@/lib/calificaciones";
import { COLORES, LISTA_COLORES } from "@/lib/decoracion";
import { ESTILO_BOTON_VERDE, ESTILO_ETIQUETA, ESTILO_INPUT } from "@/lib/formulario";
import type { Semana } from "@/lib/tipos";

const ESTILO_DETALLE = "rounded-2xl border border-slate-200 bg-slate-50/70 open:bg-white";
const ESTILO_RESUMEN =
  "flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-700 hover:text-marca-700";

// Modulo visto por el maestro: material, tareas y formularios para editarlo.
export default function ModuloMaestro({
  modulo: m,
  portadaUrl,
  alumnos,
  conteos,
  semanas,
}: {
  modulo: ModuloConRecursos;
  portadaUrl?: string;
  alumnos: number;
  conteos: Map<string, { entregadas: number; calificadas: number }>;
  semanas: Semana[];
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-tarjeta">
      <ModuloEncabezado
        modulo={m}
        portadaUrl={portadaUrl}
        acciones={
          <form action={alternarPublicado.bind(null, m.id)} className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                m.publicado ? "bg-bosque-50 text-bosque-700" : "bg-slate-100 text-slate-600"
              }`}
            >
              {m.publicado ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              {m.publicado ? "Publicado" : "Borrador"}
            </span>
            <button
              type="submit"
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              {m.publicado ? "Ocultar" : "Publicar"}
            </button>
          </form>
        }
      />

      <div className="space-y-2.5 px-5 pt-4">
        {m.recursos.length === 0 && m.tareas.length === 0 && (
          <p className="text-sm text-slate-400">Sin material ni tareas todavía.</p>
        )}
        {m.recursos.map((r) => (
          <RecursoItem key={r.id} recurso={r} />
        ))}
        {m.tareas.map((t) => {
          const c = conteos.get(t.id) ?? { entregadas: 0, calificadas: 0 };
          const pendientes = c.entregadas - c.calificadas;
          return (
            <Link
              key={t.id}
              href={`/maestro/tarea/${t.id}`}
              className="group flex flex-wrap items-center gap-3 rounded-2xl border border-marca-100 bg-gradient-to-br from-white to-marca-50/50 p-3 transition hover:border-marca-300"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-marca-700 text-white">
                <NotebookPen className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold uppercase tracking-wide text-marca-700">Tarea</span>
                <span className="block truncate text-sm font-semibold text-slate-900">{t.titulo}</span>
                <span className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-slate-500">
                  <span>
                    {c.entregadas}/{alumnos} entregadas
                  </span>
                  <span>{c.calificadas} calificadas</span>
                  {t.fecha_entrega && (
                    <span className={`inline-flex items-center gap-1 ${estaVencida(t) ? "text-red-600" : ""}`}>
                      <CalendarClock className="h-3.5 w-3.5" />
                      {formatoFecha(t.fecha_entrega)}
                    </span>
                  )}
                  <span>{formatoNota(t.puntaje_max)} pts</span>
                </span>
              </span>
              {pendientes > 0 && (
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                  {pendientes} por calificar
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-marca-700">
                Calificar <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </div>

      <div className="space-y-2 p-5">
        <details className={ESTILO_DETALLE}>
          <summary className={ESTILO_RESUMEN}>
            <UploadCloud className="h-4 w-4 text-marca-700" /> Agregar recurso
          </summary>
          <div className="space-y-4 px-4 pb-4">
            <SubidaArchivos moduloId={m.id} />
            <div className="border-t border-slate-200 pt-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                O agrega uno por uno: video, enlace, anuncio o documento
              </p>
              <FormRecurso moduloId={m.id} />
            </div>
          </div>
        </details>

        <details className={ESTILO_DETALLE}>
          <summary className={ESTILO_RESUMEN}>
            <NotebookPen className="h-4 w-4 text-marca-700" /> Nueva tarea
          </summary>
          <div className="px-4 pb-4">
            <FormAccion
              accion={crearTarea.bind(null, m.id)}
              boton="Crear tarea"
              enviando="Creando..."
              estiloBoton={ESTILO_BOTON_VERDE}
              limpiar
            >
              <div className="grid gap-3 sm:grid-cols-[1fr_13rem_7rem]">
                <label className="block">
                  <span className={ESTILO_ETIQUETA}>Título</span>
                  <input name="titulo" required maxLength={200} className={ESTILO_INPUT} />
                </label>
                <label className="block">
                  <span className={ESTILO_ETIQUETA}>Fecha de entrega</span>
                  <input name="fecha_entrega" type="datetime-local" className={ESTILO_INPUT} />
                </label>
                <label className="block">
                  <span className={ESTILO_ETIQUETA}>Puntaje máx.</span>
                  <input name="puntaje_max" type="number" min="0.5" step="0.5" defaultValue={10} required className={ESTILO_INPUT} />
                </label>
              </div>
              <label className="block">
                <span className={ESTILO_ETIQUETA}>Instrucciones</span>
                <textarea name="instrucciones" rows={3} maxLength={4000} className={ESTILO_INPUT} />
              </label>
            </FormAccion>
          </div>
        </details>

        <details className={ESTILO_DETALLE}>
          <summary className={ESTILO_RESUMEN}>
            <Paintbrush className="h-4 w-4 text-marca-700" /> Editar módulo
          </summary>
          <div className="px-4 pb-4">
            <FormAccion accion={decorarModulo.bind(null, m.id)} boton="Guardar cambios">
              <label className="block">
                <span className={ESTILO_ETIQUETA}>Semana</span>
                <select name="semana_id" defaultValue={m.semana_id ?? ""} className={ESTILO_INPUT}>
                  <option value="">Sin semana</option>
                  {semanas.map((s) => (
                    <option key={s.id} value={s.id}>
                      Semana {s.numero}
                      {s.titulo ? ` - ${s.titulo}` : ""}
                    </option>
                  ))}
                </select>
              </label>
              <fieldset>
                <legend className={ESTILO_ETIQUETA}>Color</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {LISTA_COLORES.map((nombre) => (
                    <label
                      key={nombre}
                      className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium has-[:checked]:border-slate-900 has-[:checked]:ring-2 has-[:checked]:ring-slate-900/10"
                    >
                      <input type="radio" name="color" value={nombre} defaultChecked={m.color === nombre} className="sr-only" />
                      <span className={`h-4 w-4 rounded-full ${COLORES[nombre].banda}`} />
                      {COLORES[nombre].nombre}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="block">
                <span className={ESTILO_ETIQUETA}>Imagen de portada (PNG, JPG, GIF o WEBP)</span>
                <input name="portada" type="file" accept=".png,.jpg,.jpeg,.gif,.webp" className="mt-1 block w-full text-sm" />
              </label>
              {m.portada_path && (
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="quitar_portada" />
                  Quitar la portada actual
                </label>
              )}
            </FormAccion>
          </div>
        </details>
      </div>
    </section>
  );
}
