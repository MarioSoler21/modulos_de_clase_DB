import Link from "next/link";
import FormAccion from "@/components/FormAccion";
import { ListaGrados, gradosConocidos, listarUsuarios } from "@/lib/admin";
import { ESTILO_INPUT } from "@/lib/formulario";
import { supabaseServer } from "@/lib/supabase/server";
import { crearClase } from "../actions";

interface FilaClase {
  id: string;
  nombre: string;
  grado: string;
  maestro: { nombre: string } | null;
  inscripciones: { count: number }[];
  modulos: { count: number }[];
}

export default async function AdminClasesPage() {
  const [{ data, error }, maestros, grados] = await Promise.all([
    supabaseServer()
      .from("clases")
      .select("id, nombre, grado, maestro:usuarios!clases_maestro_fk(nombre), inscripciones(count), modulos(count)")
      .order("grado")
      .order("nombre"),
    listarUsuarios("maestro"),
    gradosConocidos(),
  ]);
  if (error) throw new Error(error.message);
  const clases = (data ?? []) as unknown as FilaClase[];

  return (
    <>
      <h1 className="mb-4 text-2xl font-semibold">Clases</h1>

      <section className="mb-8 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-3 font-semibold">Nueva clase</h2>
        <FormAccion accion={crearClase} boton="Crear clase" enviando="Creando...">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="text-sm font-medium">Nombre</span>
              <input name="nombre" required maxLength={120} placeholder="Ej. Lenguaje" className={ESTILO_INPUT} />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Grado</span>
              <input name="grado" required maxLength={40} list="grados" placeholder="Ej. 7mo A" className={ESTILO_INPUT} />
              <ListaGrados id="grados" grados={grados} />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Maestro</span>
              <select name="maestro_usuario" defaultValue="" className={ESTILO_INPUT}>
                <option value="">Sin asignar</option>
                {maestros.map((m) => (
                  <option key={m.usuario} value={m.usuario}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </FormAccion>
      </section>

      {clases.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-300 p-6 text-slate-500">No hay clases todavia.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-2 font-medium">Clase</th>
                <th className="px-4 py-2 font-medium">Grado</th>
                <th className="px-4 py-2 font-medium">Maestro</th>
                <th className="px-4 py-2 text-right font-medium">Alumnos</th>
                <th className="px-4 py-2 text-right font-medium">Modulos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2">
                    <Link href={`/admin/clases/${c.id}`} className="font-medium text-blue-700 hover:underline">
                      {c.nombre}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{c.grado}</td>
                  <td className="px-4 py-2">
                    {c.maestro?.nombre ?? <span className="text-amber-700">Sin asignar</span>}
                  </td>
                  <td className="px-4 py-2 text-right">{c.inscripciones[0]?.count ?? 0}</td>
                  <td className="px-4 py-2 text-right">{c.modulos[0]?.count ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
