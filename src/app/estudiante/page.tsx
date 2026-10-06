import Link from "next/link";
import { Award, CalendarClock, CircleAlert, Hourglass, School, TrendingUp, UserRound } from "lucide-react";
import ClaseTarjeta, { Chip } from "@/components/ClaseTarjeta";
import { Estadistica, Tarjeta, TituloPagina, TituloSeccion, Vacio, saludo } from "@/components/ui";
import { formatoFecha, formatoNota } from "@/lib/calificaciones";
import { estiloClase } from "@/lib/materias";
import { resumenEstudiante } from "@/lib/resumen";
import { requerirRol } from "@/lib/sesion";

export const metadata = { title: "Mis clases" };

function diasRestantes(iso: string | null): string {
  if (!iso) return "Sin fecha";
  const dias = Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
  return dias <= 0 ? "Vence hoy" : dias === 1 ? "Vence mañana" : `Faltan ${dias} días`;
}

export default async function EstudiantePage() {
  const u = await requerirRol("estudiante");
  const r = await resumenEstudiante(u.usuario);
  const nombre = u.nombre.split(" ")[0];
  const prom = r.promedioGeneral === null ? null : Math.round(r.promedioGeneral * 10) / 10;

  return (
    <>
      <TituloPagina titulo={`${saludo()}, ${nombre}`} subtitulo={`Estudiante de ${u.grado}. Aquí tienes tus clases y tareas.`} />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Estadistica icono={School} etiqueta="Materias" valor={r.clases.length} detalle="En las que estás inscrito" />
        <Estadistica
          icono={TrendingUp}
          etiqueta="Promedio general"
          valor={prom === null ? "-" : formatoNota(prom)}
          detalle="Sobre 10, tareas calificadas"
          tono={prom === null ? "gris" : prom >= 6 ? "bosque" : "rosa"}
        />
        <Estadistica
          icono={Hourglass}
          etiqueta="Por entregar"
          valor={r.proximas.length}
          detalle={r.vencidas.length ? `${r.vencidas.length} vencida(s) sin entregar` : "Sin tareas vencidas"}
          tono={r.proximas.length ? "ambar" : "bosque"}
        />
        <Estadistica
          icono={Award}
          etiqueta="Calificadas"
          valor={`${r.calificadas}/${r.totalTareas}`}
          detalle="Tareas con nota"
          tono="violeta"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div>
          <TituloSeccion icono={School}>Mis materias</TituloSeccion>
          {r.clases.length === 0 ? (
            <Vacio icono={School}>Todavía no estás inscrito en ninguna clase. La administración te inscribirá pronto.</Vacio>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {r.clases.map((c) => (
                <ClaseTarjeta key={c.id} clase={c} href={`/estudiante/clase/${c.id}`} subtitulo={c.maestro ?? "Sin maestro asignado"}>
                  {c.promedio !== null && (
                    <Chip icono={TrendingUp} tono={c.promedio >= 6 ? "bosque" : "rojo"}>
                      Promedio {formatoNota(Math.round(c.promedio * 10) / 10)}
                    </Chip>
                  )}
                </ClaseTarjeta>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <Tarjeta className="p-5">
            <TituloSeccion icono={CalendarClock}>Próximas entregas</TituloSeccion>
            {r.proximas.length === 0 ? (
              <p className="text-sm text-slate-500">No tienes tareas pendientes. Buen trabajo.</p>
            ) : (
              <ul className="space-y-3">
                {r.proximas.slice(0, 6).map((t) => {
                  const { Icono, suave, texto } = estiloClase(r.clases.find((c) => c.id === t.clase_id) ?? { nombre: t.clase_nombre });
                  return (
                    <li key={t.id}>
                      <Link
                        href={`/estudiante/clase/${t.clase_id}`}
                        className="flex items-start gap-3 rounded-xl p-2 transition hover:bg-slate-50"
                      >
                        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${suave} ${texto}`}>
                          <Icono className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-slate-800">{t.titulo}</span>
                          <span className="block text-xs text-slate-500">
                            {t.clase_nombre} - {formatoFecha(t.fecha_entrega)}
                          </span>
                          <span className="text-xs font-semibold text-amber-700">{diasRestantes(t.fecha_entrega)}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Tarjeta>

          {r.vencidas.length > 0 && (
            <Tarjeta className="border-red-200 p-5">
              <TituloSeccion icono={CircleAlert}>Vencidas sin entregar</TituloSeccion>
              <ul className="space-y-2 text-sm">
                {r.vencidas.map((t) => (
                  <li key={t.id}>
                    <Link href={`/estudiante/clase/${t.clase_id}`} className="block rounded-lg p-1.5 hover:bg-red-50">
                      <span className="font-semibold text-slate-800">{t.titulo}</span>
                      <span className="block text-xs text-red-700">
                        {t.clase_nombre} - venció {formatoFecha(t.fecha_entrega)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Tarjeta>
          )}

          <Tarjeta className="p-5">
            <TituloSeccion icono={UserRound}>Mis datos</TituloSeccion>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
              <dt className="text-slate-500">Nombre</dt>
              <dd className="font-medium">{u.nombre}</dd>
              <dt className="text-slate-500">Usuario</dt>
              <dd className="font-medium">{u.usuario}</dd>
              <dt className="text-slate-500">Grado</dt>
              <dd className="font-medium">{u.grado}</dd>
            </dl>
          </Tarjeta>
        </aside>
      </div>
    </>
  );
}
