import Link from "next/link";
import { notFound } from "next/navigation";
import FormAccion from "@/components/FormAccion";
import { alumnosDeClase, claseDeUsuario } from "@/lib/acceso";
import { ListaGrados, gradosConocidos, listarUsuarios } from "@/lib/admin";
import { ESTILO_BOTON_PELIGRO, ESTILO_BOTON_SECUNDARIO, ESTILO_INPUT } from "@/lib/formulario";
import { requerirRol } from "@/lib/sesion";
import { borrarClase, editarClase, inscribirAlumno, inscribirGrado, quitarAlumno } from "../../actions";

export default async function AdminClasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requerirRol("admin");
  const clase = await claseDeUsuario(admin, id);
  if (!clase) notFound();

  const [inscritos, estudiantes, maestros, grados] = await Promise.all([
    alumnosDeClase(clase.id),
    listarUsuarios("estudiante"),
    listarUsuarios("maestro"),
    gradosConocidos(),
  ]);
  const yaInscritos = new Set(inscritos.map((a) => a.usuario));
  // Primero los del mismo grado de la clase, luego el resto.
  const disponibles = estudiantes
    .filter((e) => !yaInscritos.has(e.usuario))
    .sort((a, b) => Number(b.grado === clase.grado) - Number(a.grado === clase.grado) || a.nombre.localeCompare(b.nombre));

  return (
    <>
      <Link href="/admin/clases" className="mb-4 inline-block text-sm text-blue-700 hover:underline">
        Volver a clases
      </Link>
      <h1 className="mb-6 text-2xl font-semibold">
        {clase.nombre} <span className="font-normal text-slate-500">- {clase.grado}</span>
      </h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <section className="h-fit rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 font-semibold">Datos de la clase</h2>
          <FormAccion accion={editarClase.bind(null, clase.id)} boton="Guardar cambios">
            <label className="block">
              <span className="text-sm font-medium">Nombre</span>
              <input name="nombre" required maxLength={120} defaultValue={clase.nombre} className={ESTILO_INPUT} />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Grado</span>
              <input name="grado" required maxLength={40} list="grados" defaultValue={clase.grado} className={ESTILO_INPUT} />
              <ListaGrados id="grados" grados={grados} />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Maestro</span>
              <select name="maestro_usuario" defaultValue={clase.maestro_usuario ?? ""} className={ESTILO_INPUT}>
                <option value="">Sin asignar</option>
                {maestros.map((m) => (
                  <option key={m.usuario} value={m.usuario}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </label>
          </FormAccion>

          <div className="mt-6 border-t border-slate-100 pt-4">
            <FormAccion
              accion={borrarClase.bind(null, clase.id)}
              boton="Borrar clase"
              enviando="Borrando..."
              estiloBoton={ESTILO_BOTON_PELIGRO}
              confirmar={`Se borrara "${clase.nombre}" con todos sus modulos, recursos y archivos. No se puede deshacer.`}
            />
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 font-semibold">Alumnos inscritos ({inscritos.length})</h2>

          <FormAccion
            accion={inscribirAlumno.bind(null, clase.id)}
            boton="Inscribir"
            enviando="Inscribiendo..."
            className="mb-3 flex flex-wrap items-end gap-3"
          >
            <label className="block min-w-56 flex-1">
              <span className="text-sm font-medium">Agregar alumno</span>
              <select name="estudiante_usuario" required defaultValue="" className={ESTILO_INPUT}>
                <option value="" disabled>
                  {disponibles.length ? "Selecciona un alumno" : "No hay alumnos disponibles"}
                </option>
                {disponibles.map((e) => (
                  <option key={e.usuario} value={e.usuario}>
                    {e.nombre} ({e.grado})
                  </option>
                ))}
              </select>
            </label>
          </FormAccion>

          <FormAccion
            accion={inscribirGrado.bind(null, clase.id)}
            boton={`Inscribir a todo ${clase.grado}`}
            enviando="Inscribiendo..."
            estiloBoton={ESTILO_BOTON_SECUNDARIO}
            className="mb-4"
          />

          {inscritos.length === 0 ? (
            <p className="text-sm text-slate-500">Todavia no hay alumnos inscritos.</p>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {inscritos.map((a) => (
                <li key={a.usuario} className="flex items-center justify-between gap-3 py-2">
                  <span>
                    {a.nombre} <span className="text-slate-400">- {a.usuario}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className={a.grado === clase.grado ? "text-slate-500" : "text-amber-700"}>{a.grado}</span>
                    <FormAccion
                      accion={quitarAlumno.bind(null, clase.id, a.usuario)}
                      boton="Quitar"
                      enviando="..."
                      estiloBoton={ESTILO_BOTON_SECUNDARIO}
                      className=""
                    />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
