import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, NotebookPen, TrendingUp, Users } from "lucide-react";
import { Avatar, Estadistica, TituloPagina, Vacio, Volver } from "@/components/ui";
import { alumnosDeClase, claseDeUsuario, entregasDeTareas, modulosDeClase } from "@/lib/acceso";
import { formatoNota, promedio, sobreDiez } from "@/lib/calificaciones";
import { requerirRol } from "@/lib/sesion";

export const metadata = { title: "Calificaciones" };

function colorNota(valorSobreDiez: number) {
  return valorSobreDiez >= 8 ? "bg-bosque-50 text-bosque-800" : valorSobreDiez >= 6 ? "bg-marca-50 text-marca-800" : "bg-red-50 text-red-700";
}

// Libro de calificaciones: alumnos por tareas, con promedio sobre 10.
export default async function CalificacionesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const u = await requerirRol("maestro");
  const clase = await claseDeUsuario(u, id);
  if (!clase) notFound();

  const [modulos, alumnos] = await Promise.all([modulosDeClase(clase.id, false), alumnosDeClase(clase.id)]);
  const tareas = modulos.flatMap((m) => m.tareas.map((t) => ({ ...t, modulo: m.titulo })));
  const entregas = await entregasDeTareas(tareas.map((t) => t.id));
  const nota = (tareaId: string, alumno: string) =>
    entregas.find((e) => e.tarea_id === tareaId && e.estudiante_usuario === alumno);

  const promedios = alumnos.map((a) => promedio(tareas, entregas.filter((e) => e.estudiante_usuario === a.usuario)));
  const conNota = promedios.filter((p): p is number => p !== null);
  const promedioClase = conNota.length ? conNota.reduce((a, b) => a + b, 0) / conNota.length : null;
  const aprobados = conNota.filter((p) => p >= 6).length;

  return (
    <>
      <Volver href={`/maestro/clase/${clase.id}`} texto={`${clase.nombre} - ${clase.grado}`} />
      <TituloPagina
        icono={Award}
        titulo="Calificaciones"
        subtitulo={`${clase.nombre} - ${clase.grado}. El promedio es sobre 10 y solo cuenta las tareas calificadas.`}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Estadistica icono={Users} etiqueta="Alumnos" valor={alumnos.length} />
        <Estadistica icono={NotebookPen} etiqueta="Tareas" valor={tareas.length} tono="violeta" />
        <Estadistica
          icono={TrendingUp}
          etiqueta="Promedio de la clase"
          valor={promedioClase === null ? "-" : formatoNota(Math.round(promedioClase * 10) / 10)}
          detalle="Sobre 10"
          tono="bosque"
        />
        <Estadistica
          icono={Award}
          etiqueta="Aprobando"
          valor={`${aprobados}/${conNota.length}`}
          detalle="Promedio de 6 o más"
          tono="ambar"
        />
      </div>

      {tareas.length === 0 || alumnos.length === 0 ? (
        <Vacio icono={Award}>
          {tareas.length === 0
            ? "Todavía no hay tareas. Créalas desde cada módulo con \"Nueva tarea\"."
            : "No hay alumnos inscritos en esta clase."}
        </Vacio>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-tarjeta">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="sticky left-0 bg-slate-50 px-4 py-3 font-semibold">Alumno</th>
                {tareas.map((t) => (
                  <th key={t.id} className="min-w-32 px-3 py-3 text-center font-semibold">
                    <Link href={`/maestro/tarea/${t.id}`} className="text-marca-700 hover:underline">
                      {t.titulo}
                    </Link>
                    <span className="block text-xs font-normal text-slate-400">
                      {t.modulo} - /{formatoNota(t.puntaje_max)}
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3 text-center font-semibold">Promedio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {alumnos.map((a, i) => {
                const prom = promedios[i];
                return (
                  <tr key={a.usuario} className="hover:bg-slate-50/70">
                    <td className="sticky left-0 bg-white px-4 py-2.5">
                      <span className="flex items-center gap-2.5 font-medium">
                        <Avatar nombre={a.nombre} tamano="sm" />
                        {a.nombre}
                      </span>
                    </td>
                    {tareas.map((t) => {
                      const e = nota(t.id, a.usuario);
                      return (
                        <td key={t.id} className="px-3 py-2.5 text-center">
                          {e?.nota !== null && e?.nota !== undefined ? (
                            <span
                              className={`inline-block min-w-12 rounded-lg px-2 py-1 font-semibold ${colorNota(sobreDiez(e.nota, t.puntaje_max))}`}
                            >
                              {formatoNota(e.nota)}
                            </span>
                          ) : e?.entregada_at ? (
                            <span className="text-xs font-semibold text-marca-700">Por calificar</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-2.5 text-center">
                      {prom === null ? (
                        <span className="text-slate-300">-</span>
                      ) : (
                        <span
                          className={`inline-block min-w-12 rounded-lg px-2 py-1 font-extrabold ${
                            prom >= 6 ? "bg-bosque-700 text-white" : "bg-red-600 text-white"
                          }`}
                        >
                          {formatoNota(Math.round(prom * 10) / 10)}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
