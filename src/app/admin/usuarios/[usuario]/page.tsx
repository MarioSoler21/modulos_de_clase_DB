import Link from "next/link";
import { notFound } from "next/navigation";
import { AtSign, GraduationCap, Pencil, School, ShieldCheck, Trash2, UserRound } from "lucide-react";
import FormAccion from "@/components/FormAccion";
import { Tarjeta, TituloSeccion, Volver, iniciales } from "@/components/ui";
import { ListaGrados, gradosConocidos } from "@/lib/admin";
import {
  ESTILO_BOTON_PELIGRO,
  ESTILO_BOTON_SECUNDARIO,
  ESTILO_BOTON_VERDE,
  ESTILO_ETIQUETA,
  ESTILO_INPUT,
} from "@/lib/formulario";
import { estiloClase } from "@/lib/materias";
import { buscarUsuario, requerirRol } from "@/lib/sesion";
import { supabaseServer } from "@/lib/supabase/server";
import {
  asignarClaseAMaestro,
  borrarUsuario,
  editarUsuario,
  inscribirEnClase,
  inscribirEnSuGrado,
  quitarAlumno,
} from "../../actions";

const ETIQUETA_ROL = { admin: "Administrador", maestro: "Maestro", estudiante: "Alumno" };
const ICONO_ROL = { admin: ShieldCheck, maestro: UserRound, estudiante: GraduationCap };

interface ClaseBreve {
  id: string;
  nombre: string;
  grado: string;
  maestro_usuario: string | null;
  icono: string | null;
  tema: string | null;
}

export default async function AdminUsuarioPage({ params }: { params: Promise<{ usuario: string }> }) {
  const { usuario } = await params;
  const admin = await requerirRol("admin");
  const u = await buscarUsuario(decodeURIComponent(usuario));
  if (!u) notFound();

  const supabase = supabaseServer();
  const [{ data: todas }, { data: inscripciones }, grados] = await Promise.all([
    supabase.from("clases").select("id, nombre, grado, maestro_usuario, icono, tema").order("grado").order("nombre"),
    u.rol === "estudiante"
      ? supabase.from("inscripciones").select("clase_id").eq("estudiante_usuario", u.usuario)
      : Promise.resolve({ data: [] as { clase_id: string }[] }),
    gradosConocidos(),
  ]);
  const clasesTodas = (todas ?? []) as ClaseBreve[];
  const inscritas = new Set((inscripciones ?? []).map((i) => i.clase_id));
  const suyas =
    u.rol === "maestro"
      ? clasesTodas.filter((c) => c.maestro_usuario === u.usuario)
      : clasesTodas.filter((c) => inscritas.has(c.id));
  // Opciones para agregar: primero las del grado del alumno.
  const disponibles = clasesTodas
    .filter((c) => (u.rol === "maestro" ? c.maestro_usuario !== u.usuario : !inscritas.has(c.id)))
    .sort((a, b) => Number(b.grado === u.grado) - Number(a.grado === u.grado));
  const esYo = u.usuario === admin.usuario;
  const IconoRol = ICONO_ROL[u.rol];

  return (
    <>
      <Volver href={`/admin/usuarios?rol=${u.rol}`} texto="Usuarios" />

      <div className="fondo-marca relative mb-6 overflow-hidden rounded-3xl p-6 text-white shadow-elevada sm:p-8">
        <div className="patron-puntos pointer-events-none absolute inset-0" />
        <div className="relative flex flex-wrap items-center gap-5">
          <span className="grid h-20 w-20 place-items-center rounded-3xl bg-white text-2xl font-extrabold text-marca-700">
            {iniciales(u.nombre)}
          </span>
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider ring-1 ring-white/20">
              <IconoRol className="h-3.5 w-3.5" /> {ETIQUETA_ROL[u.rol]}
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{u.nombre}</h1>
            <p className="mt-1 flex flex-wrap gap-x-4 text-white/80">
              <span className="inline-flex items-center gap-1">
                <AtSign className="h-4 w-4" /> {u.usuario}
              </span>
              {u.grado && (
                <span className="inline-flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" /> {u.grado}
                </span>
              )}
              {u.rol !== "admin" && (
                <span className="inline-flex items-center gap-1">
                  <School className="h-4 w-4" /> {suyas.length} clase(s)
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <Tarjeta className="p-5">
            <TituloSeccion icono={Pencil}>Datos</TituloSeccion>
            <FormAccion accion={editarUsuario.bind(null, u.usuario)} boton="Guardar cambios">
              <label className="block">
                <span className={ESTILO_ETIQUETA}>Nombre completo</span>
                <input name="nombre" required maxLength={120} defaultValue={u.nombre} className={ESTILO_INPUT} />
              </label>
              {u.rol === "estudiante" && (
                <label className="block">
                  <span className={ESTILO_ETIQUETA}>Grado</span>
                  <input name="grado" required maxLength={40} list="grados" defaultValue={u.grado ?? ""} className={ESTILO_INPUT} />
                  <ListaGrados id="grados" grados={grados} />
                </label>
              )}
              <label className="block">
                <span className={ESTILO_ETIQUETA}>Nueva clave</span>
                <input
                  name="clave"
                  type="text"
                  minLength={6}
                  autoComplete="off"
                  placeholder="Dejar vacío para no cambiarla"
                  className={ESTILO_INPUT}
                />
              </label>
            </FormAccion>
          </Tarjeta>

          {!esYo && (
            <Tarjeta className="border-red-100 p-5">
              <TituloSeccion icono={Trash2}>Zona de riesgo</TituloSeccion>
              <FormAccion
                accion={borrarUsuario.bind(null, u.usuario)}
                boton="Borrar usuario"
                enviando="Borrando..."
                estiloBoton={ESTILO_BOTON_PELIGRO}
                confirmar={
                  u.rol === "maestro"
                    ? `Se borrará a ${u.nombre}. Sus clases quedarán sin maestro asignado.`
                    : `Se borrará a ${u.nombre} con sus inscripciones y entregas. No se puede deshacer.`
                }
              />
            </Tarjeta>
          )}
        </div>

        {u.rol !== "admin" && (
          <Tarjeta className="h-fit p-5">
            <TituloSeccion icono={School}>
              {u.rol === "maestro" ? "Clases que imparte" : "Clases en las que está inscrito"} ({suyas.length})
            </TituloSeccion>

            <div className="mb-4 space-y-3 rounded-xl bg-slate-50 p-3">
              <FormAccion
                accion={u.rol === "maestro" ? asignarClaseAMaestro.bind(null, u.usuario) : inscribirEnClase.bind(null, u.usuario)}
                boton={u.rol === "maestro" ? "Asignar" : "Inscribir"}
                enviando="Guardando..."
                estiloBoton={ESTILO_BOTON_VERDE}
                className="flex flex-wrap items-end gap-3"
              >
                <label className="block min-w-60 flex-1">
                  <span className={ESTILO_ETIQUETA}>{u.rol === "maestro" ? "Asignar clase" : "Inscribir en clase"}</span>
                  <select name="clase_id" required defaultValue="" className={ESTILO_INPUT}>
                    <option value="" disabled>
                      {disponibles.length ? "Selecciona una clase" : "No hay clases disponibles"}
                    </option>
                    {disponibles.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} - {c.grado}
                        {u.rol === "maestro" && c.maestro_usuario ? " (tiene maestro)" : ""}
                      </option>
                    ))}
                  </select>
                </label>
              </FormAccion>
              {u.rol === "estudiante" && u.grado && (
                <FormAccion
                  accion={inscribirEnSuGrado.bind(null, u.usuario)}
                  boton={`Inscribir en todas las clases de ${u.grado}`}
                  enviando="Inscribiendo..."
                  estiloBoton={ESTILO_BOTON_SECUNDARIO}
                  className=""
                />
              )}
            </div>

            {suyas.length === 0 ? (
              <p className="text-sm text-slate-500">Ninguna por ahora.</p>
            ) : (
              <ul className="space-y-2">
                {suyas.map((c) => {
                  const { Icono, suave, texto } = estiloClase(c);
                  return (
                    <li key={c.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-2.5">
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${suave} ${texto}`}>
                        <Icono className="h-4 w-4" />
                      </span>
                      <Link href={`/admin/clases/${c.id}`} className="min-w-0 flex-1 hover:text-marca-700">
                        <span className="block truncate text-sm font-semibold">{c.nombre}</span>
                        <span className="block text-xs text-slate-500">{c.grado}</span>
                      </Link>
                      {u.rol === "estudiante" && (
                        <FormAccion
                          accion={quitarAlumno.bind(null, c.id, u.usuario)}
                          boton="Quitar"
                          enviando="..."
                          estiloBoton={ESTILO_BOTON_SECUNDARIO}
                          className=""
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Tarjeta>
        )}
      </div>
    </>
  );
}
