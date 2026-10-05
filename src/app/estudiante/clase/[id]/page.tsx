import { notFound } from "next/navigation";
import RecursoItem from "@/components/RecursoItem";
import Volver from "@/components/Volver";
import { claseDeUsuario, modulosDeClase } from "@/lib/acceso";
import { requerirRol } from "@/lib/sesion";

export default async function ClaseEstudiantePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const u = await requerirRol("estudiante");
  const clase = await claseDeUsuario(u, id);
  if (!clase) notFound();

  const modulos = await modulosDeClase(clase.id, true);

  return (
    <>
      <Volver href="/estudiante" />
      <h1 className="text-2xl font-semibold">{clase.nombre}</h1>
      <p className="mb-6 text-slate-500">{clase.grado}</p>

      {modulos.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-300 p-6 text-slate-500">
          Tu maestro todavia no ha publicado modulos en esta clase.
        </p>
      ) : (
        <div className="space-y-4">
          {modulos.map((m) => (
            <section key={m.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <h2 className="text-lg font-semibold">
                <span className="text-slate-400">{m.orden}.</span> {m.titulo}
              </h2>
              {m.descripcion && <p className="mb-3 text-sm text-slate-600">{m.descripcion}</p>}
              {m.recursos.length === 0 ? (
                <p className="text-sm text-slate-400">Sin material todavia.</p>
              ) : (
                <div className="space-y-2">
                  {m.recursos.map((r) => (
                    <RecursoItem key={r.id} recurso={r} />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </>
  );
}
