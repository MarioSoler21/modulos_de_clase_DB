import Link from "next/link";
import { notFound } from "next/navigation";
import FormAccion from "@/components/FormAccion";
import { ListaGrados, gradosConocidos } from "@/lib/admin";
import { ESTILO_BOTON_PELIGRO, ESTILO_INPUT } from "@/lib/formulario";
import { buscarUsuario, requerirRol } from "@/lib/sesion";
import { supabaseServer } from "@/lib/supabase/server";
import { borrarUsuario, editarUsuario } from "../../actions";

const ETIQUETA_ROL = { admin: "Administrador", maestro: "Maestro", estudiante: "Alumno" };

async function clasesDe(usuario: string, rol: string) {
  const supabase = supabaseServer();
  if (rol === "maestro") {
    const { data } = await supabase.from("clases").select("id, nombre, grado").eq("maestro_usuario", usuario).order("nombre");
    return data ?? [];
  }
  if (rol === "estudiante") {
    const { data } = await supabase
      .from("clases")
      .select("id, nombre, grado, inscripciones!inner(estudiante_usuario)")
      .eq("inscripciones.estudiante_usuario", usuario)
      .order("nombre");
    return data ?? [];
  }
  return [];
}

export default async function AdminUsuarioPage({ params }: { params: Promise<{ usuario: string }> }) {
  const { usuario } = await params;
  const admin = await requerirRol("admin");
  const u = await buscarUsuario(decodeURIComponent(usuario));
  if (!u) notFound();

  const [clases, grados] = await Promise.all([clasesDe(u.usuario, u.rol), gradosConocidos()]);
  const esYo = u.usuario === admin.usuario;

  return (
    <>
      <Link href={`/admin/usuarios?rol=${u.rol}`} className="mb-4 inline-block text-sm text-blue-700 hover:underline">
        Volver a usuarios
      </Link>
      <h1 className="text-2xl font-semibold">{u.nombre}</h1>
      <p className="mb-6 text-slate-500">
        {ETIQUETA_ROL[u.rol]} - usuario: {u.usuario}
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="h-fit rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 font-semibold">Datos</h2>
          <FormAccion accion={editarUsuario.bind(null, u.usuario)} boton="Guardar cambios">
            <label className="block">
              <span className="text-sm font-medium">Nombre completo</span>
              <input name="nombre" required maxLength={120} defaultValue={u.nombre} className={ESTILO_INPUT} />
            </label>
            {u.rol === "estudiante" && (
              <label className="block">
                <span className="text-sm font-medium">Grado</span>
                <input name="grado" required maxLength={40} list="grados" defaultValue={u.grado ?? ""} className={ESTILO_INPUT} />
                <ListaGrados id="grados" grados={grados} />
              </label>
            )}
            <label className="block">
              <span className="text-sm font-medium">Nueva clave</span>
              <input
                name="clave"
                type="text"
                minLength={6}
                autoComplete="off"
                placeholder="Dejar vacio para no cambiarla"
                className={ESTILO_INPUT}
              />
            </label>
          </FormAccion>

          {!esYo && (
            <div className="mt-6 border-t border-slate-100 pt-4">
              <FormAccion
                accion={borrarUsuario.bind(null, u.usuario)}
                boton="Borrar usuario"
                enviando="Borrando..."
                estiloBoton={ESTILO_BOTON_PELIGRO}
                confirmar={
                  u.rol === "maestro"
                    ? `Se borrara a ${u.nombre}. Sus clases quedaran sin maestro asignado.`
                    : `Se borrara a ${u.nombre} y sus inscripciones. No se puede deshacer.`
                }
              />
            </div>
          )}
        </section>

        {u.rol !== "admin" && (
          <section className="h-fit rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-3 font-semibold">
              {u.rol === "maestro" ? "Clases que imparte" : "Clases en las que esta inscrito"} ({clases.length})
            </h2>
            {clases.length === 0 ? (
              <p className="text-sm text-slate-500">Ninguna por ahora. Se asignan desde la pantalla de cada clase.</p>
            ) : (
              <ul className="divide-y divide-slate-100 text-sm">
                {clases.map((c) => (
                  <li key={c.id} className="flex justify-between py-2">
                    <Link href={`/admin/clases/${c.id}`} className="text-blue-700 hover:underline">
                      {c.nombre}
                    </Link>
                    <span className="text-slate-500">{c.grado}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </>
  );
}
