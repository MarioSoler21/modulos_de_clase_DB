import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, CalendarClock, ClipboardCheck, FileText, Layers, NotebookPen, Users } from "lucide-react";
import FormAccion from "@/components/FormAccion";
import { Avatar, Estadistica, Tarjeta, TituloPagina, Volver } from "@/components/ui";
import { alumnosDeClase, entregasDeTareas, tareaDeMaestro } from "@/lib/acceso";
import { entregadaTarde, estaVencida, formatoFecha, formatoNota, sobreDiez } from "@/lib/calificaciones";
import { ESTILO_BOTON_PELIGRO, ESTILO_BOTON_SECUNDARIO, ESTILO_INPUT } from "@/lib/formulario";
import { requerirRol } from "@/lib/sesion";
import { borrarTarea, calificar } from "../../clase/[id]/actions";

export default async function TareaMaestroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const u = await requerirRol("maestro");
  const datos = await tareaDeMaestro(u, id);
  if (!datos) notFound();
  const { tarea, clase } = datos;

  const [alumnos, entregas] = await Promise.all([alumnosDeClase(clase.id), entregasDeTareas([tarea.id])]);
  const porAlumno = new Map(entregas.map((e) => [e.estudiante_usuario, e]));
  const entregadas = entregas.filter((e) => e.entregada_at).length;
  const notas = entregas.filter((e) => e.nota !== null).map((e) => Number(e.nota));
  const calificadas = notas.length;
  const media = notas.length ? notas.reduce((a, b) => a + b, 0) / notas.length : null;

  return (
    <>
      <Volver href={`/maestro/clase/${clase.id}`} texto={`${clase.nombre} - ${clase.grado}`} />
      <TituloPagina
        icono={NotebookPen}
        titulo={tarea.titulo}
        subtitulo={
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="inline-flex items-center gap-1">
              <Layers className="h-4 w-4" /> {tarea.modulo_titulo}
            </span>
            <span className="inline-flex items-center gap-1">
              <Award className="h-4 w-4" /> Vale {formatoNota(tarea.puntaje_max)} puntos
            </span>
            {tarea.fecha_entrega && (
              <span className={`inline-flex items-center gap-1 ${estaVencida(tarea) ? "text-red-600" : ""}`}>
                <CalendarClock className="h-4 w-4" /> Entrega: {formatoFecha(tarea.fecha_entrega)}
              </span>
            )}
          </span>
        }
        acciones={
          <Link href={`/maestro/clase/${clase.id}/calificaciones`} className={ESTILO_BOTON_SECUNDARIO}>
            <Award className="h-4 w-4" /> Libro de calificaciones
          </Link>
        }
      />

      {tarea.instrucciones && (
        <Tarjeta className="mb-6 p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">Instrucciones</p>
          <p className="whitespace-pre-line text-sm text-slate-700">{tarea.instrucciones}</p>
        </Tarjeta>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Estadistica icono={Users} etiqueta="Alumnos" valor={alumnos.length} />
        <Estadistica icono={FileText} etiqueta="Entregas" valor={`${entregadas}/${alumnos.length}`} tono="violeta" />
        <Estadistica icono={ClipboardCheck} etiqueta="Calificadas" valor={`${calificadas}/${alumnos.length}`} tono="bosque" />
        <Estadistica
          icono={Award}
          etiqueta="Nota media"
          valor={media === null ? "-" : formatoNota(Math.round(media * 10) / 10)}
          detalle={media === null ? "Sin notas" : `${formatoNota(Math.round(sobreDiez(media, tarea.puntaje_max) * 10) / 10)} sobre 10`}
          tono="ambar"
        />
      </div>

      <h2 className="mb-3 text-lg font-bold">
        Entregas: {entregadas}/{alumnos.length} - Calificadas: {calificadas}/{alumnos.length}
      </h2>

      {alumnos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-6 text-slate-500">No hay alumnos inscritos en esta clase.</p>
      ) : (
        <div className="space-y-3">
          {alumnos.map((a) => {
            const e = porAlumno.get(a.usuario);
            const entrego = !!e?.entregada_at;
            const tarde = entrego && entregadaTarde(tarea, e!);
            return (
              <div key={a.usuario} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-tarjeta">
                <div className="grid gap-4 md:grid-cols-[1fr_21rem]">
                  <div>
                    <div className="flex items-center gap-3">
                      <Avatar nombre={a.nombre} />
                      <div>
                        <p className="font-semibold">
                          {a.nombre} <span className="text-sm font-normal text-slate-400">- {a.grado}</span>
                        </p>
                        <p className={`text-xs font-semibold ${!entrego ? "text-slate-400" : tarde ? "text-amber-700" : "text-bosque-700"}`}>
                          {!entrego ? "Sin entrega" : `Entregada ${formatoFecha(e!.entregada_at)}${tarde ? " (tarde)" : ""}`}
                        </p>
                      </div>
                    </div>
                    {entrego && (
                      <div className="mt-3 space-y-1 text-sm">
                        {e!.storage_path && (
                          <a
                            href={`/api/signed-url?entrega=${e!.id}`}
                            target="_blank"
                            rel="noopener"
                            className="inline-flex items-center gap-1.5 font-medium text-marca-700 hover:underline"
                          >
                            <FileText className="h-4 w-4" />
                            {e!.nombre_archivo ?? "Ver archivo"}
                          </a>
                        )}
                        {e!.comentario && (
                          <p className="whitespace-pre-line rounded-xl bg-slate-50 p-2.5 text-slate-700">{e!.comentario}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <FormAccion
                    accion={calificar.bind(null, tarea.id, a.usuario)}
                    boton="Guardar nota"
                    estiloBoton={ESTILO_BOTON_SECUNDARIO}
                    className="space-y-2 rounded-xl bg-slate-50 p-3"
                  >
                    <label className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-slate-700">Nota</span>
                      <input
                        name="nota"
                        type="number"
                        min={0}
                        max={tarea.puntaje_max}
                        step="0.01"
                        defaultValue={e?.nota ?? ""}
                        className="w-24 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm font-semibold outline-none focus:border-marca-600 focus:ring-4 focus:ring-marca-100"
                      />
                      <span className="text-slate-500">/ {formatoNota(tarea.puntaje_max)}</span>
                    </label>
                    <textarea
                      name="retroalimentacion"
                      rows={2}
                      maxLength={2000}
                      placeholder="Retroalimentación para el alumno (opcional)"
                      defaultValue={e?.retroalimentacion ?? ""}
                      className={ESTILO_INPUT}
                    />
                  </FormAccion>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 border-t border-slate-200 pt-4">
        <FormAccion
          accion={borrarTarea.bind(null, tarea.id)}
          boton="Borrar tarea"
          enviando="Borrando..."
          estiloBoton={ESTILO_BOTON_PELIGRO}
          confirmar={`Se borrará la tarea "${tarea.titulo}" con todas sus entregas y notas. No se puede deshacer.`}
        />
      </div>
    </>
  );
}
