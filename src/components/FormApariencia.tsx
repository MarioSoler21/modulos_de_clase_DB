import FormAccion from "@/components/FormAccion";
import { ESTILO_ETIQUETA } from "@/lib/formulario";
import { ICONOS, TEMAS, aparienciaPorDefecto } from "@/lib/materias";
import type { AccionForm } from "@/lib/formulario";
import type { Clase } from "@/lib/tipos";

// Selector de icono y color de la clase (solo el maestro de la clase).
export default function FormApariencia({ clase, accion }: { clase: Clase; accion: AccionForm }) {
  const defecto = aparienciaPorDefecto(clase.nombre);
  const iconoActual = clase.icono ?? defecto.icono;
  const temaActual = clase.tema ?? defecto.tema;
  const opcion =
    "cursor-pointer rounded-xl border border-slate-200 bg-white transition hover:border-slate-400 has-[:checked]:border-marca-700 has-[:checked]:ring-2 has-[:checked]:ring-marca-200";

  return (
    <FormAccion accion={accion} boton="Guardar apariencia">
      <fieldset>
        <legend className={ESTILO_ETIQUETA}>Icono</legend>
        <div className="mt-2 grid grid-cols-6 gap-1.5 sm:grid-cols-8 lg:grid-cols-6">
          {Object.entries(ICONOS).map(([clave, { Icono, nombre }]) => (
            <label key={clave} title={nombre} className={`${opcion} grid aspect-square place-items-center text-slate-600 has-[:checked]:text-marca-700`}>
              <input type="radio" name="icono" value={clave} defaultChecked={iconoActual === clave} className="sr-only" />
              <Icono className="h-5 w-5" />
              <span className="sr-only">{nombre}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className={ESTILO_ETIQUETA}>Color</legend>
        <div className="mt-2 grid grid-cols-5 gap-1.5">
          {Object.entries(TEMAS).map(([clave, tema]) => (
            <label key={clave} title={tema.nombre} className={`${opcion} p-1`}>
              <input type="radio" name="tema" value={clave} defaultChecked={temaActual === clave} className="sr-only" />
              <span className={`block h-7 rounded-lg bg-gradient-to-br ${tema.degradado}`} />
              <span className="sr-only">{tema.nombre}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </FormAccion>
  );
}
