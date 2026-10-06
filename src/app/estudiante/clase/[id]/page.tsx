import { notFound } from "next/navigation";
import { Award, CalendarDays, Hourglass, Layers, TrendingUp } from "lucide-react";
import CabeceraClase from "@/components/CabeceraClase";
import ModuloEncabezado from "@/components/ModuloEncabezado";
import SemanaBanner from "@/components/SemanaBanner";
import RecursoItem from "@/components/RecursoItem";
import TareaAlumno from "@/components/TareaAlumno";
import { Tarjeta, TituloSeccion, Vacio, Volver } from "@/components/ui";
import { claseDeUsuario, entregasDeAlumnoEnClase, modulosDeClase, semanasDeClase, type ModuloConRecursos } from "@/lib/acceso";
import { formatoNota, promedio } from "@/lib/calificaciones";
import { estiloClase } from "@/lib/materias";
import { urlsPortadas } from "@/lib/portadas";
import { estadoSemana } from "@/lib/semanas";
import { buscarUsuario, requerirRol } from "@/lib/sesion";

export default async function ClaseEstudiantePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const u = await requerirRol("estudiante");
  const clase = await claseDeUsuario(u, id);
  if (!clase) notFound();

  // Modulos, maestro y entregas no dependen entre si: van en paralelo.
  const [modulos, maestro, todasEntregas, todasSemanas] = await Promise.all([
    modulosDeClase(clase.id, true),
    clase.maestro_usuario ? buscarUsuario(clase.maestro_usuario) : null,
    entregasDeAlumnoEnClase(u.usuario, clase.id),
    semanasDeClase(clase.id),
  ]);
  const tareas = modulos.flatMap((m) => m.tareas);
  // Solo cuentan las entregas de tareas visibles (modulos publicados).
  const visibles = new Set(tareas.map((t) => t.id));
  const entregas = todasEntregas.filter((e) => visibles.has(e.tarea_id));
  // El alumno solo ve las semanas que tienen al menos un modulo publicado.
  const semanas = todasSemanas.filter((s) => modulos.some((m) => m.semana_id === s.id));
  const sinSemana = modulos.filter((m) => !semanas.some((s) => s.id === m.semana_id));
  const actual = semanas.find((s) => estadoSemana(s.fecha_inicio) === "actual");
  const estilo = estiloClase(clase);
  const [portadas, portadasSemanas] = await Promise.all([urlsPortadas(modulos), urlsPortadas(semanas)]);
  const porTarea = new Map(entregas.map((e) => [e.tarea_id, e]));
  const prom = promedio(tareas, entregas);
  const promRedondo = prom === null ? null : Math.round(prom * 10) / 10;
  const calificadas = entregas.filter((e) => e.nota !== null).length;
  const pendientes = tareas.filter((t) => !porTarea.get(t.id)?.entregada_at && porTarea.get(t.id)?.nota == null).length;

  const lista = (mods: ModuloConRecursos[]) =>
    mods.map((m) => (
      <section key={m.id} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-tarjeta">
        <ModuloEncabezado modulo={m} portadaUrl={portadas.get(m.id)} />
        <div className="space-y-2.5 p-5">
          {m.recursos.length === 0 && m.tareas.length === 0 ? (
            <p className="text-sm text-slate-400">Sin material todavía.</p>
          ) : (
            <>
              {m.recursos.map((r) => (
                <RecursoItem key={r.id} recurso={r} />
              ))}
              {m.tareas.map((t) => (
                <TareaAlumno key={t.id} tarea={t} entrega={porTarea.get(t.id)} />
              ))}
            </>
          )}
        </div>
      </section>
    ));

  return (
    <>
      <Volver href="/estudiante" texto="Mis clases" />
      <CabeceraClase clase={clase} maestro={maestro?.nombre ?? null}>
        {actual && (
          <a
            href={`#semana-${actual.numero}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 font-semibold text-slate-800"
          >
            <CalendarDays className="h-4 w-4" /> Ir a la semana actual ({actual.numero})
          </a>
        )}
        {promRedondo !== null && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 font-bold text-slate-800">
            <TrendingUp className="h-4 w-4" /> Promedio {formatoNota(promRedondo)}
          </span>
        )}
        {pendientes > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 font-semibold text-amber-950">
            <Hourglass className="h-4 w-4" /> {pendientes} por entregar
          </span>
        )}
      </CabeceraClase>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0">
          {modulos.length === 0 ? (
            <Vacio icono={Layers}>Tu maestro todavía no ha publicado material en esta clase.</Vacio>
          ) : (
            <div className="space-y-8">
              {semanas.map((s) => (
                <section
                  key={s.id}
                  id={`semana-${s.numero}`}
                  className={`scroll-mt-24 overflow-hidden rounded-3xl border bg-white shadow-tarjeta ${
                    actual?.id === s.id ? "border-amber-300 ring-4 ring-amber-100" : "border-slate-200/80"
                  }`}
                >
                  <SemanaBanner semana={s} portadaUrl={portadasSemanas.get(s.id)} estilo={estilo} />
                  <div className="space-y-4 bg-slate-50/60 p-4 sm:p-5">
                    {lista(modulos.filter((m) => m.semana_id === s.id))}
                  </div>
                </section>
              ))}
              {sinSemana.length > 0 && (
                <section>
                  {semanas.length > 0 && <TituloSeccion icono={Layers}>Otros módulos</TituloSeccion>}
                  <div className="space-y-4">{lista(sinSemana)}</div>
                </section>
              )}
            </div>
          )}
        </div>

        <aside>
          <Tarjeta className="p-5 lg:sticky lg:top-24">
            <TituloSeccion icono={Award}>Mis calificaciones</TituloSeccion>
            <div className="mb-4 flex items-center gap-4 rounded-xl bg-slate-50 p-3">
              <span
                className={`grid h-14 w-14 place-items-center rounded-2xl text-xl font-extrabold text-white ${
                  promRedondo === null ? "bg-slate-300" : promRedondo >= 6 ? "bg-bosque-700" : "bg-red-600"
                }`}
              >
                {promRedondo === null ? "-" : formatoNota(promRedondo)}
              </span>
              <div className="text-sm">
                <p className="font-semibold text-slate-800">
                  Promedio: {promRedondo === null ? "sin notas todavía" : `${formatoNota(promRedondo)} / 10`}
                </p>
                <p className="text-slate-500">
                  {calificadas} de {tareas.length} calificadas
                  {pendientes > 0 && ` - ${pendientes} por entregar`}
                </p>
              </div>
            </div>
            {tareas.length === 0 ? (
              <p className="text-sm text-slate-500">Esta clase todavía no tiene tareas.</p>
            ) : (
              <ul className="divide-y divide-slate-100 text-sm">
                {tareas.map((t) => {
                  const e = porTarea.get(t.id);
                  return (
                    <li key={t.id} className="flex items-center justify-between gap-3 py-2">
                      <span className="min-w-0 truncate">{t.titulo}</span>
                      <span className="shrink-0 text-right">
                        {e?.nota !== null && e?.nota !== undefined ? (
                          <span className="font-bold text-slate-800">
                            {formatoNota(e.nota)}
                            <span className="font-normal text-slate-400"> / {formatoNota(t.puntaje_max)}</span>
                          </span>
                        ) : e?.entregada_at ? (
                          <span className="text-xs font-semibold text-marca-700">Por calificar</span>
                        ) : (
                          <span className="text-xs text-slate-400">Sin entregar</span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Tarjeta>
        </aside>
      </div>
    </>
  );
}
