import { notFound } from "next/navigation";
import FormModulo from "@/components/FormModulo";
import FormRecurso from "@/components/FormRecurso";
import RecursoItem from "@/components/RecursoItem";
import Volver from "@/components/Volver";
import { alumnosDeClase, claseDeUsuario, modulosDeClase } from "@/lib/acceso";
import { requerirRol } from "@/lib/sesion";
import { alternarPublicado } from "./actions";

export default async function ClaseMaestroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const u = await requerirRol("maestro");
  const clase = await claseDeUsuario(u, id);
  if (!clase) notFound();

  const [modulos, alumnos] = await Promise.all([modulosDeClase(clase.id, false), alumnosDeClase(clase.id)]);
  const siguienteOrden = modulos.reduce((max, m) => Math.max(max, m.orden), 0) + 1;

  return (
    <>
      <Volver href="/maestro" />
      <h1 className="text-2xl font-semibold">{clase.nombre}</h1>
      <p className="mb-6 text-slate-500">{clase.grado}</p>

      <details className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
        <summary className="cursor-pointer font-semibold">Alumnos inscritos ({alumnos.length})</summary>
        {alumnos.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            Todavia no hay alumnos inscritos. La administracion se encarga de las inscripciones.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100 text-sm">
            {alumnos.map((a) => (
              <li key={a.usuario} className="flex justify-between py-2">
                <span>{a.nombre}</span>
                <span className="text-slate-500">{a.grado}</span>
              </li>
            ))}
          </ul>
        )}
      </details>

      <section className="mb-8 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-3 font-semibold">Nuevo modulo</h2>
        <FormModulo claseId={clase.id} siguienteOrden={siguienteOrden} />
      </section>

      <h2 className="mb-3 text-lg font-semibold">Modulos ({modulos.length})</h2>
      {modulos.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-300 p-6 text-slate-500">
          Esta clase todavia no tiene modulos. Crea el primero arriba.
        </p>
      ) : (
        <div className="space-y-4">
          {modulos.map((m) => (
            <section key={m.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold">
                    <span className="text-slate-400">{m.orden}.</span> {m.titulo}
                  </h3>
                  {m.descripcion && <p className="text-sm text-slate-600">{m.descripcion}</p>}
                </div>
                <form action={alternarPublicado.bind(null, m.id)} className="flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      m.publicado ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {m.publicado ? "Publicado" : "Borrador"}
                  </span>
                  <button type="submit" className="rounded-md border border-slate-300 px-2 py-0.5 text-xs hover:bg-slate-100">
                    {m.publicado ? "Ocultar" : "Publicar"}
                  </button>
                </form>
              </div>

              <div className="mt-3 space-y-2">
                {m.recursos.length === 0 ? (
                  <p className="text-sm text-slate-400">Sin recursos todavia.</p>
                ) : (
                  m.recursos.map((r) => <RecursoItem key={r.id} recurso={r} />)
                )}
              </div>

              <details className="mt-4 rounded-md bg-slate-50 p-3">
                <summary className="cursor-pointer text-sm font-medium text-blue-700">Agregar recurso</summary>
                <div className="mt-3">
                  <FormRecurso moduloId={m.id} />
                </div>
              </details>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
