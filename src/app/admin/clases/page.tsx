import Link from "next/link";
import { ChevronRight, Clock, Plus, School, UserRound, Users } from "lucide-react";
import CamposClase from "@/components/CamposClase";
import FormAccion from "@/components/FormAccion";
import { Tarjeta, TituloPagina, TituloSeccion, Vacio } from "@/components/ui";
import { gradosConocidos, listarUsuarios } from "@/lib/admin";
import { estiloClase } from "@/lib/materias";
import { supabaseServer } from "@/lib/supabase/server";
import type { Clase } from "@/lib/tipos";
import { crearClase } from "../actions";

export const metadata = { title: "Clases" };

type FilaClase = Clase & {
  maestro: { nombre: string } | null;
  inscripciones: { count: number }[];
  modulos: { count: number }[];
};

export default async function AdminClasesPage() {
  const [{ data, error }, maestros, grados] = await Promise.all([
    supabaseServer()
      .from("clases")
      .select("*, maestro:usuarios!clases_maestro_fk(nombre), inscripciones(count), modulos(count)")
      .order("grado")
      .order("nombre"),
    listarUsuarios("maestro"),
    gradosConocidos(),
  ]);
  if (error) throw new Error(error.message);
  const clases = (data ?? []) as unknown as FilaClase[];
  const porGrado = [...new Set(clases.map((c) => c.grado))].map((g) => ({
    grado: g,
    clases: clases.filter((c) => c.grado === g),
  }));

  return (
    <>
      <TituloPagina icono={School} titulo="Clases" subtitulo={`${clases.length} clases en ${porGrado.length} grados`} />

      <Tarjeta className="mb-8 p-5">
        <TituloSeccion icono={Plus}>Nueva clase</TituloSeccion>
        <FormAccion accion={crearClase} boton="Crear clase" enviando="Creando...">
          <CamposClase maestros={maestros} grados={grados} />
        </FormAccion>
      </Tarjeta>

      {clases.length === 0 ? (
        <Vacio icono={School}>No hay clases todavía.</Vacio>
      ) : (
        <div className="space-y-8">
          {porGrado.map(({ grado, clases }) => (
            <section key={grado}>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
                <span className="rounded-lg bg-marca-700 px-2.5 py-0.5 text-sm text-white">{grado}</span>
                <span className="text-sm font-medium text-slate-500">{clases.length} clases</span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {clases.map((c) => {
                  const { Icono, suave, texto } = estiloClase(c);
                  return (
                    <Link
                      key={c.id}
                      href={`/admin/clases/${c.id}`}
                      className="group flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-tarjeta transition hover:-translate-y-0.5 hover:shadow-elevada"
                    >
                      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${suave} ${texto}`}>
                        <Icono className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold text-slate-900">{c.nombre}</span>
                        <span
                          className={`mt-0.5 flex items-center gap-1 text-sm ${c.maestro ? "text-slate-600" : "font-semibold text-amber-700"}`}
                        >
                          <UserRound className="h-3.5 w-3.5" />
                          {c.maestro?.nombre ?? "Sin maestro"}
                        </span>
                        <span className="mt-1 flex flex-wrap gap-x-3 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" /> {c.inscripciones[0]?.count ?? 0} alumnos
                          </span>
                          <span>{c.modulos[0]?.count ?? 0} módulos</span>
                          {c.horario && (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" /> {c.horario}
                            </span>
                          )}
                        </span>
                      </span>
                      <ChevronRight className="mt-1 h-4 w-4 text-slate-300 transition group-hover:text-marca-700" />
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
