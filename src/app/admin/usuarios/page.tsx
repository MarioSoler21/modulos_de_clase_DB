import Link from "next/link";
import FormAccion from "@/components/FormAccion";
import CamposUsuarioNuevo from "@/components/CamposUsuarioNuevo";
import { gradosConocidos, listarUsuarios } from "@/lib/admin";
import { supabaseServer } from "@/lib/supabase/server";
import type { Rol } from "@/lib/tipos";
import { crearUsuario } from "../actions";

const PESTANAS: { rol: Rol; texto: string }[] = [
  { rol: "estudiante", texto: "Alumnos" },
  { rol: "maestro", texto: "Maestros" },
  { rol: "admin", texto: "Administradores" },
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

export default async function AdminUsuariosPage({ searchParams }: { searchParams: Promise<{ rol?: string }> }) {
  const { rol: rolParam } = await searchParams;
  const rol: Rol = PESTANAS.some((p) => p.rol === rolParam) ? (rolParam as Rol) : "estudiante";

  const [usuarios, conteo, grados] = await Promise.all([listarUsuarios(rol), conteoClases(rol), gradosConocidos()]);

  return (
    <>
      <h1 className="mb-4 text-2xl font-semibold">Usuarios</h1>

      <section className="mb-8 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-3 font-semibold">Nuevo usuario</h2>
        <FormAccion accion={crearUsuario} boton="Crear usuario" enviando="Creando..." limpiar>
          <CamposUsuarioNuevo rolInicial={rol} grados={grados} />
        </FormAccion>
      </section>

      <nav className="mb-3 flex gap-1 border-b border-slate-200 text-sm">
        {PESTANAS.map((p) => (
          <Link
            key={p.rol}
            href={`/admin/usuarios?rol=${p.rol}`}
            className={`-mb-px border-b-2 px-4 py-2 ${
              p.rol === rol ? "border-blue-700 font-medium text-blue-700" : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            {p.texto}
          </Link>
        ))}
      </nav>

      {usuarios.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-300 p-6 text-slate-500">No hay usuarios con este rol.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-2 font-medium">Nombre</th>
                <th className="px-4 py-2 font-medium">Usuario</th>
                {rol === "estudiante" && <th className="px-4 py-2 font-medium">Grado</th>}
                {rol !== "admin" && (
                  <th className="px-4 py-2 text-right font-medium">{rol === "estudiante" ? "Inscrito en" : "Imparte"}</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuarios.map((u) => (
                <tr key={u.usuario} className="hover:bg-slate-50">
                  <td className="px-4 py-2">
                    <Link href={`/admin/usuarios/${u.usuario}`} className="font-medium text-blue-700 hover:underline">
                      {u.nombre}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-slate-600">{u.usuario}</td>
                  {rol === "estudiante" && <td className="px-4 py-2">{u.grado}</td>}
                  {rol !== "admin" && (
                    <td className="px-4 py-2 text-right">{conteo.get(u.usuario) ?? 0} clase(s)</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
