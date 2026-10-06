import Link from "next/link";
import { ChevronRight, GraduationCap, ShieldCheck, UserPlus, UserRound, Users } from "lucide-react";
import CamposUsuarioNuevo from "@/components/CamposUsuarioNuevo";
import FormAccion from "@/components/FormAccion";
import { Avatar, Tarjeta, TituloPagina, TituloSeccion, Vacio } from "@/components/ui";
import { gradosConocidos, listarUsuarios } from "@/lib/admin";
import { supabaseServer } from "@/lib/supabase/server";
import type { Rol } from "@/lib/tipos";
import { crearUsuario } from "../actions";

export const metadata = { title: "Usuarios" };

const PESTANAS: { rol: Rol; texto: string; Icono: typeof Users }[] = [
  { rol: "estudiante", texto: "Alumnos", Icono: GraduationCap },
  { rol: "maestro", texto: "Maestros", Icono: UserRound },
  { rol: "admin", texto: "Administradores", Icono: ShieldCheck },
];

// Cuantas clases tiene cada usuario: inscritas (alumno) o impartidas (maestro).
async function conteoClases(rol: Rol): Promise<Map<string, number>> {
  const conteo = new Map<string, number>();
  if (rol === "admin") return conteo;
  const { data } =
    rol === "estudiante"
      ? await supabaseServer().from("inscripciones").select("u:estudiante_usuario")
      : await supabaseServer().from("clases").select("u:maestro_usuario");
  for (const f of (data ?? []) as { u: string | null }[]) {
    if (f.u) conteo.set(f.u, (conteo.get(f.u) ?? 0) + 1);
  }
  return conteo;
}

export default async function AdminUsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ rol?: string; grado?: string }>;
}) {
  const { rol: rolParam, grado } = await searchParams;
  const rol: Rol = PESTANAS.some((p) => p.rol === rolParam) ? (rolParam as Rol) : "estudiante";

  const [todos, conteo, grados] = await Promise.all([listarUsuarios(), conteoClases(rol), gradosConocidos()]);
  const delRol = todos.filter((u) => u.rol === rol);
  const usuarios = rol === "estudiante" && grado ? delRol.filter((u) => u.grado === grado) : delRol;
  const gradosAlumnos = [...new Set(todos.filter((u) => u.rol === "estudiante").map((u) => u.grado as string))].sort();

  return (
    <>
      <TituloPagina
        icono={Users}
        titulo="Usuarios"
        subtitulo={`${todos.filter((u) => u.rol === "estudiante").length} alumnos, ${
          todos.filter((u) => u.rol === "maestro").length
        } maestros y ${todos.filter((u) => u.rol === "admin").length} administradores`}
      />

      <Tarjeta className="mb-8 p-5">
        <TituloSeccion icono={UserPlus}>Nuevo usuario</TituloSeccion>
        <FormAccion accion={crearUsuario} boton="Crear usuario" enviando="Creando..." limpiar>
          <CamposUsuarioNuevo rolInicial={rol} grados={grados} />
        </FormAccion>
      </Tarjeta>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap gap-1 rounded-2xl bg-slate-100 p-1 text-sm">
          {PESTANAS.map(({ rol: r, texto, Icono }) => (
            <Link
              key={r}
              href={`/admin/usuarios?rol=${r}`}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-semibold transition ${
                r === rol ? "bg-white text-marca-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Icono className="h-4 w-4" />
              {texto}
              <span className={`rounded-full px-1.5 text-xs ${r === rol ? "bg-marca-50" : "bg-slate-200"}`}>
                {todos.filter((u) => u.rol === r).length}
              </span>
            </Link>
          ))}
        </nav>
        {rol === "estudiante" && (
          <div className="flex flex-wrap gap-1.5 text-sm">
            <Link
              href="/admin/usuarios?rol=estudiante"
              className={`rounded-full px-3 py-1 font-semibold ${!grado ? "bg-marca-700 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}
            >
              Todos
            </Link>
            {gradosAlumnos.map((g) => (
              <Link
                key={g}
                href={`/admin/usuarios?rol=estudiante&grado=${encodeURIComponent(g)}`}
                className={`rounded-full px-3 py-1 font-semibold ${
                  grado === g ? "bg-marca-700 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"
                }`}
              >
                {g}
              </Link>
            ))}
          </div>
        )}
      </div>

      {usuarios.length === 0 ? (
        <Vacio icono={Users}>No hay usuarios con este filtro.</Vacio>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-tarjeta">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">Usuario</th>
                {rol === "estudiante" && <th className="px-4 py-3 font-semibold">Grado</th>}
                {rol !== "admin" && (
                  <th className="px-4 py-3 text-right font-semibold">{rol === "estudiante" ? "Inscrito en" : "Imparte"}</th>
                )}
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuarios.map((u) => (
                <tr key={u.usuario} className="group hover:bg-slate-50/70">
                  <td className="px-4 py-2.5">
                    <Link href={`/admin/usuarios/${u.usuario}`} className="flex items-center gap-3 font-semibold text-slate-900 group-hover:text-marca-700">
                      <Avatar nombre={u.nombre} />
                      {u.nombre}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">{u.usuario}</td>
                  {rol === "estudiante" && (
                    <td className="px-4 py-2.5">
                      <span className="rounded-lg bg-marca-50 px-2 py-0.5 text-xs font-semibold text-marca-700">{u.grado}</span>
                    </td>
                  )}
                  {rol !== "admin" && (
                    <td className="px-4 py-2.5 text-right">
                      <span className={(conteo.get(u.usuario) ?? 0) === 0 ? "font-semibold text-amber-700" : ""}>
                        {conteo.get(u.usuario) ?? 0} clase(s)
                      </span>
                    </td>
                  )}
                  <td className="pr-3">
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-marca-700" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
