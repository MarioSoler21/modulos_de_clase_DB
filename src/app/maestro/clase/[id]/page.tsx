import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, CalendarDays, CalendarPlus, ClipboardCheck, Layers, Palette, Pencil, Plus, Users } from "lucide-react";
import CabeceraClase from "@/components/CabeceraClase";
import FormAccion from "@/components/FormAccion";
import FormApariencia from "@/components/FormApariencia";
import FormModulo from "@/components/FormModulo";
import ModuloMaestro from "@/components/ModuloMaestro";
import SemanaBanner from "@/components/SemanaBanner";
import { Avatar, Tarjeta, TituloSeccion, Vacio, Volver } from "@/components/ui";
import {
  alumnosDeClase,
  claseDeUsuario,
  entregasDeTareas,
  modulosDeClase,
  semanasDeClase,
  type ModuloConRecursos,
} from "@/lib/acceso";
import { ESTILO_BOTON_PELIGRO, ESTILO_BOTON_VERDE, ESTILO_ETIQUETA, ESTILO_INPUT } from "@/lib/formulario";
import { estiloClase } from "@/lib/materias";
import { urlsPortadas } from "@/lib/portadas";
import { estadoSemana, hoyHonduras, lunesDe, sumarDias } from "@/lib/semanas";
import { requerirRol } from "@/lib/sesion";
import { borrarSemana, crearSemana, editarSemana, personalizarClase } from "./actions";

export default async function ClaseMaestroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const u = await requerirRol("maestro");
  const clase = await claseDeUsuario(u, id);
  if (!clase) notFound();

  const [modulos, alumnos, semanas] = await Promise.all([
    modulosDeClase(clase.id, false),
    alumnosDeClase(clase.id),
    semanasDeClase(clase.id),
  ]);
  const [portadasModulos, portadasSemanas, entregas] = await Promise.all([
    urlsPortadas(modulos),
    urlsPortadas(semanas),
    entregasDeTareas(modulos.flatMap((m) => m.tareas.map((t) => t.id))),
  ]);

  const estilo = estiloClase(clase);
  const conteos = new Map<string, { entregadas: number; calificadas: number }>();
  for (const e of entregas) {
    const c = conteos.get(e.tarea_id) ?? { entregadas: 0, calificadas: 0 };
    if (e.entregada_at) c.entregadas++;
    if (e.nota !== null) c.calificadas++;
    conteos.set(e.tarea_id, c);
  }
  const porCalificar = entregas.filter((e) => e.entregada_at && e.nota === null).length;
  const siguienteOrden = modulos.reduce((max, m) => Math.max(max, m.orden), 0) + 1;

  const actual = semanas.find((s) => estadoSemana(s.fecha_inicio) === "actual");
  const ultima = semanas.at(-1);
  const siguienteNumero = (ultima?.numero ?? 0) + 1;
  const siguienteFecha = ultima?.fecha_inicio ? sumarDias(ultima.fecha_inicio, 7) : lunesDe(hoyHonduras());
  const sinSemana = modulos.filter((m) => !m.semana_id || !semanas.some((s) => s.id === m.semana_id));

  const lista = (mods: ModuloConRecursos[]) =>
    mods.map((m) => (
      <ModuloMaestro
        key={m.id}
        modulo={m}
        portadaUrl={portadasModulos.get(m.id)}
        alumnos={alumnos.length}
        conteos={conteos}
        semanas={semanas}
      />
    ));

  return (
    <>
      <Volver href="/maestro" texto="Mis clases" />
      <CabeceraClase
        clase={clase}
        maestro={u.nombre}
        acciones={
          <Link
            href={`/maestro/clase/${clase.id}/calificaciones`}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-marca-700 shadow-sm transition hover:bg-marca-50"
          >
            <Award className="h-4 w-4" /> Calificaciones
          </Link>
        }
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/20">
          <Users className="h-4 w-4" /> {alumnos.length} alumnos
        </span>
        {actual && (
          <a
            href={`#semana-${actual.numero}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 font-semibold text-slate-800"
          >
            <CalendarDays className="h-4 w-4" /> Ir a la semana actual ({actual.numero})
          </a>
        )}
        {porCalificar > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 font-semibold text-amber-950">
            <ClipboardCheck className="h-4 w-4" /> {porCalificar} por calificar
          </span>
        )}
      </CabeceraClase>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-8">
          {semanas.length === 0 && sinSemana.length === 0 && (
            <Vacio icono={CalendarDays}>
              Esta clase todavía no tiene semanas. Crea la semana 1 con el formulario de la derecha.
            </Vacio>
          )}

          {semanas.map((s) => {
            const mods = modulos.filter((m) => m.semana_id === s.id);
            return (
              <section
                key={s.id}
                id={`semana-${s.numero}`}
                className={`scroll-mt-24 overflow-hidden rounded-3xl border bg-white shadow-tarjeta ${
                  actual?.id === s.id ? "border-amber-300 ring-4 ring-amber-100" : "border-slate-200/80"
                }`}
              >
                <SemanaBanner semana={s} portadaUrl={portadasSemanas.get(s.id)} estilo={estilo} />
                <details className="border-b border-slate-100 bg-white">
                  <summary className="flex cursor-pointer items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-600 hover:text-marca-700">
                    <Pencil className="h-4 w-4" /> Editar semana {s.numero}: título, fecha y banner
                  </summary>
                  <div className="space-y-4 px-5 pb-5">
                    <FormAccion accion={editarSemana.bind(null, s.id)} boton="Guardar semana">
                      <div className="grid gap-3 sm:grid-cols-[1fr_11rem]">
                        <label className="block">
                          <span className={ESTILO_ETIQUETA}>Título (opcional)</span>
                          <input
                            name="titulo"
                            maxLength={160}
                            defaultValue={s.titulo ?? ""}
                            placeholder={`Semana ${s.numero}`}
                            className={ESTILO_INPUT}
                          />
                        </label>
                        <label className="block">
                          <span className={ESTILO_ETIQUETA}>Inicia (lunes)</span>
                          <input name="fecha_inicio" type="date" defaultValue={s.fecha_inicio ?? ""} className={ESTILO_INPUT} />
                        </label>
                      </div>
                      <label className="block">
                        <span className={ESTILO_ETIQUETA}>Descripción (opcional)</span>
                        <input
                          name="descripcion"
                          maxLength={600}
                          defaultValue={s.descripcion ?? ""}
                          placeholder="Qué se verá esta semana"
                          className={ESTILO_INPUT}
                        />
                      </label>
                      <label className="block">
                        <span className={ESTILO_ETIQUETA}>Imagen del banner (se muestra a lo ancho)</span>
                        <input name="portada" type="file" accept=".png,.jpg,.jpeg,.gif,.webp" className="mt-1 block w-full text-sm" />
                      </label>
                      {s.portada_path && (
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" name="quitar_portada" />
                          Quitar la imagen actual
                        </label>
                      )}
                    </FormAccion>
                    <FormAccion
                      accion={borrarSemana.bind(null, s.id)}
                      boton={`Borrar semana ${s.numero}`}
                      enviando="Borrando..."
                      estiloBoton={ESTILO_BOTON_PELIGRO}
                      confirmar={`Se borrará la semana ${s.numero}. Sus módulos no se borran: quedan "sin semana".`}
                      className=""
                    />
                  </div>
                </details>
                <div className="space-y-4 bg-slate-50/60 p-4 sm:p-5">
                  {mods.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-center text-sm text-slate-500">
                      Sin módulos en esta semana. Crea uno con "Nuevo módulo" y elige la semana {s.numero}.
                    </p>
                  ) : (
                    lista(mods)
                  )}
                </div>
              </section>
            );
          })}

          {sinSemana.length > 0 && (
            <section>
              <TituloSeccion icono={Layers}>Módulos sin semana ({sinSemana.length})</TituloSeccion>
              <div className="space-y-4">{lista(sinSemana)}</div>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <Tarjeta className="p-5">
            <TituloSeccion icono={CalendarPlus}>Nueva semana</TituloSeccion>
            <FormAccion
              accion={crearSemana.bind(null, clase.id)}
              boton={`Crear semana ${siguienteNumero}`}
              enviando="Creando..."
              estiloBoton={ESTILO_BOTON_VERDE}
            >
              <div className="grid grid-cols-[5rem_1fr] gap-3">
                <label className="block">
                  <span className={ESTILO_ETIQUETA}>Número</span>
                  <input
                    key={siguienteNumero}
                    name="numero"
                    type="number"
                    min={1}
                    max={60}
                    required
                    defaultValue={siguienteNumero}
                    className={ESTILO_INPUT}
                  />
                </label>
                <label className="block">
                  <span className={ESTILO_ETIQUETA}>Inicia (lunes)</span>
                  <input key={siguienteFecha} name="fecha_inicio" type="date" defaultValue={siguienteFecha} className={ESTILO_INPUT} />
                </label>
              </div>
              <label className="block">
                <span className={ESTILO_ETIQUETA}>Título (opcional)</span>
                <input name="titulo" maxLength={160} placeholder="Ej. Repaso para el examen" className={ESTILO_INPUT} />
              </label>
            </FormAccion>
          </Tarjeta>

          <Tarjeta className="p-5">
            <TituloSeccion icono={Plus}>Nuevo módulo</TituloSeccion>
            <FormModulo
              claseId={clase.id}
              siguienteOrden={siguienteOrden}
              semanas={semanas.map((s) => ({ id: s.id, etiqueta: `Semana ${s.numero}${s.titulo ? ` - ${s.titulo}` : ""}` }))}
              semanaPorDefecto={(actual ?? ultima)?.id ?? ""}
            />
          </Tarjeta>

          <Tarjeta className="p-5">
            <TituloSeccion icono={Palette}>Apariencia de la clase</TituloSeccion>
            <p className="mb-3 text-xs text-slate-500">
              Elige el icono y el color con los que tus alumnos ven esta clase. El nombre, el grado y el horario los
              maneja la administración.
            </p>
            <FormApariencia clase={clase} accion={personalizarClase.bind(null, clase.id)} />
          </Tarjeta>

          <Tarjeta className="p-5">
            <TituloSeccion icono={Users}>Alumnos ({alumnos.length})</TituloSeccion>
            {alumnos.length === 0 ? (
              <p className="text-sm text-slate-500">
                Todavía no hay alumnos inscritos. La administración se encarga de las inscripciones.
              </p>
            ) : (
              <ul className="space-y-2">
                {alumnos.map((a) => (
                  <li key={a.usuario} className="flex items-center gap-2.5 text-sm">
                    <Avatar nombre={a.nombre} tamano="sm" />
                    <span className="flex-1 font-medium">{a.nombre}</span>
                    <span className="text-xs text-slate-400">{a.grado}</span>
                  </li>
                ))}
              </ul>
            )}
          </Tarjeta>
        </aside>
      </div>
    </>
  );
}
