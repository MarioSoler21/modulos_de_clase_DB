import { notFound } from "next/navigation";
import { Pencil, Trash2, Users } from "lucide-react";
import CabeceraClase from "@/components/CabeceraClase";
import CamposClase from "@/components/CamposClase";
import FormAccion from "@/components/FormAccion";
import { Avatar, Tarjeta, TituloSeccion, Volver } from "@/components/ui";
import { alumnosDeClase, claseDeUsuario } from "@/lib/acceso";
import { gradosConocidos, listarUsuarios } from "@/lib/admin";
import { ESTILO_BOTON_PELIGRO, ESTILO_BOTON_SECUNDARIO, ESTILO_BOTON_VERDE, ESTILO_ETIQUETA, ESTILO_INPUT } from "@/lib/formulario";
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
  const maestro = maestros.find((m) => m.usuario === clase.maestro_usuario);

  return (
    <>
      <Volver href="/admin/clases" texto="Clases" />
      <CabeceraClase clase={clase} maestro={maestro?.nombre ?? null}>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/20">
          <Users className="h-4 w-4" /> {inscritos.length} alumnos
        </span>
      </CabeceraClase>

      <div className="space-y-6">
        <Tarjeta className="p-5">
          <TituloSeccion icono={Users}>Alumnos inscritos ({inscritos.length})</TituloSeccion>
          <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl bg-slate-50 p-3">
            <FormAccion
              accion={inscribirAlumno.bind(null, clase.id)}
              boton="Inscribir"
              enviando="Inscribiendo..."
              estiloBoton={ESTILO_BOTON_VERDE}
              className="flex flex-1 flex-wrap items-end gap-3"
            >
              <label className="block min-w-60 flex-1">
                <span className={ESTILO_ETIQUETA}>Agregar alumno</span>
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
              className=""
            />
          </div>

          {inscritos.length === 0 ? (
            <p className="text-sm text-slate-500">Todavía no hay alumnos inscritos.</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {inscritos.map((a) => (
                <li key={a.usuario} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <Avatar nombre={a.nombre} tamano="sm" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{a.nombre}</span>
                      <span className={`block text-xs ${a.grado === clase.grado ? "text-slate-400" : "text-amber-700"}`}>
                        {a.usuario} - {a.grado}
                      </span>
                    </span>
                  </span>
                  <FormAccion
                    accion={quitarAlumno.bind(null, clase.id, a.usuario)}
                    boton="Quitar"
                    enviando="..."
                    estiloBoton={ESTILO_BOTON_SECUNDARIO}
                    className=""
                  />
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>

        <Tarjeta className="p-5">
          <TituloSeccion icono={Pencil}>Datos de la clase</TituloSeccion>
          <FormAccion accion={editarClase.bind(null, clase.id)} boton="Guardar cambios">
            <CamposClase clase={clase} maestros={maestros} grados={grados} />
          </FormAccion>
        </Tarjeta>

        <Tarjeta className="border-red-100 p-5">
          <TituloSeccion icono={Trash2}>Zona de riesgo</TituloSeccion>
          <p className="mb-3 text-sm text-slate-500">
            Borrar la clase elimina sus módulos, recursos, tareas, entregas y archivos. No se puede deshacer.
          </p>
          <FormAccion
            accion={borrarClase.bind(null, clase.id)}
            boton="Borrar clase"
            enviando="Borrando..."
            estiloBoton={ESTILO_BOTON_PELIGRO}
            confirmar={`Se borrará "${clase.nombre}" (${clase.grado}) con todos sus módulos, recursos, tareas y archivos. No se puede deshacer.`}
          />
        </Tarjeta>
      </div>
    </>
  );
}
