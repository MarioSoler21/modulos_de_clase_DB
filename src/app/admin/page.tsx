import Link from "next/link";
import {
  CircleAlert,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  Plus,
  School,
  UserPlus,
  UserRound,
  Users,
} from "lucide-react";
import { Avatar, Estadistica, Tarjeta, TituloPagina, TituloSeccion } from "@/components/ui";
import { formatoFecha, formatoNota } from "@/lib/calificaciones";
import { ESTILO_BOTON, ESTILO_BOTON_SECUNDARIO } from "@/lib/formulario";
import { resumenAdmin } from "@/lib/resumen";

export const metadata = { title: "Administración" };

export default async function AdminInicioPage() {
  const r = await resumenAdmin();
  const maxAlumnos = Math.max(1, ...r.porGrado.map((g) => g.alumnos));

  return (
    <>
      <TituloPagina
        icono={LayoutDashboard}
        titulo="Panel de administración"
        subtitulo="Instituto Don Bosco - Secundaria"
        acciones={
          <>
            <Link href="/admin/usuarios" className={ESTILO_BOTON_SECUNDARIO}>
              <UserPlus className="h-4 w-4" /> Nuevo usuario
            </Link>
            <Link href="/admin/clases" className={ESTILO_BOTON}>
              <Plus className="h-4 w-4" /> Nueva clase
            </Link>
          </>
        }
      />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Estadistica icono={GraduationCap} etiqueta="Alumnos" valor={r.alumnos} detalle={`${r.porGrado.length} grados`} />
        <Estadistica icono={UserRound} etiqueta="Maestros" valor={r.maestros} detalle="Docentes activos" tono="bosque" />
        <Estadistica icono={School} etiqueta="Clases" valor={r.clases} detalle={`${r.sinMaestro.length} sin maestro`} tono="violeta" />
        <Estadistica icono={ClipboardCheck} etiqueta="Inscripciones" valor={r.inscripciones} detalle="Alumno-clase" tono="ambar" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Tarjeta className="p-5">
          <TituloSeccion icono={Users}>Alumnos por grado</TituloSeccion>
          <ul className="space-y-3">
            {r.porGrado.map((g) => (
              <li key={g.grado}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-semibold">{g.grado}</span>
                  <span className="text-slate-500">
                    {g.alumnos} alumnos - {g.clases} clases
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-marca-700 to-bosque-600"
                    style={{ width: `${(g.alumnos / maxAlumnos) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Tarjeta>

        <Tarjeta className="p-5">
          <TituloSeccion icono={CircleAlert}>Pendientes de asignación</TituloSeccion>
          {r.sinMaestro.length === 0 && r.alumnosSinClases.length === 0 ? (
            <p className="rounded-xl bg-bosque-50 p-3 text-sm text-bosque-800">
              Todas las clases tienen maestro y todos los alumnos están inscritos en al menos una clase.
            </p>
          ) : (
            <div className="space-y-4 text-sm">
              {r.sinMaestro.length > 0 && (
                <div>
                  <p className="mb-1 font-semibold text-amber-800">Clases sin maestro</p>
                  <ul className="space-y-1">
                    {r.sinMaestro.map((c) => (
                      <li key={c.id}>
                        <Link href={`/admin/clases/${c.id}`} className="text-marca-700 hover:underline">
                          {c.nombre} - {c.grado}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {r.alumnosSinClases.length > 0 && (
                <div>
                  <p className="mb-1 font-semibold text-amber-800">Alumnos sin clases</p>
                  <ul className="space-y-1">
                    {r.alumnosSinClases.map((a) => (
                      <li key={a.usuario}>
                        <Link href={`/admin/usuarios/${a.usuario}`} className="text-marca-700 hover:underline">
                          {a.nombre} ({a.grado})
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Tarjeta>

        <Tarjeta className="p-5">
          <TituloSeccion icono={UserRound}>Maestros</TituloSeccion>
          <ul className="divide-y divide-slate-100">
            {r.maestros_lista.map((m) => (
              <li key={m.usuario}>
                <Link href={`/admin/usuarios/${m.usuario}`} className="flex items-center gap-3 py-2 hover:text-marca-700">
                  <Avatar nombre={m.nombre} />
                  <span className="flex-1 text-sm font-medium">{m.nombre}</span>
                  <span className="text-xs text-slate-500">{m.clases} clase(s)</span>
                </Link>
              </li>
            ))}
          </ul>
        </Tarjeta>

        <Tarjeta className="p-5">
          <TituloSeccion icono={ClipboardCheck}>Últimas entregas</TituloSeccion>
          {r.ultimasEntregas.length === 0 ? (
            <p className="text-sm text-slate-500">Todavía no hay entregas.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {r.ultimasEntregas.map((e, i) => (
                <li key={i} className="flex items-center gap-3 py-2 text-sm">
                  <Avatar nombre={e.alumno} tamano="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{e.tarea}</span>
                    <span className="block truncate text-xs text-slate-500">
                      {e.alumno} - {e.clase}
                    </span>
                  </span>
                  <span className="text-right text-xs text-slate-500">
                    {formatoFecha(e.fecha)}
                    <span className="block font-semibold text-slate-700">
                      {e.nota === null ? "Sin nota" : `Nota ${formatoNota(e.nota)}`}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>
      </div>
    </>
  );
}
