import { ESTILO_ETIQUETA, ESTILO_INPUT } from "@/lib/formulario";
import type { Clase, Usuario } from "@/lib/tipos";

export const MATERIAS_SUGERIDAS = [
  "Matemáticas",
  "Español",
  "Inglés",
  "Literatura",
  "Computación",
  "Ciencias Naturales",
  "Estudios Sociales",
  "Educación Física",
  "Educación Artística",
  "Música",
  "Moral, Cívica y Ética",
];

// Campos del formulario de alta y edicion de clases (admin).
export default function CamposClase({
  clase,
  maestros,
  grados,
}: {
  clase?: Clase;
  maestros: Usuario[];
  grados: string[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <label className="block">
        <span className={ESTILO_ETIQUETA}>Materia</span>
        <input
          name="nombre"
          required
          maxLength={120}
          list="materias-sugeridas"
          defaultValue={clase?.nombre}
          placeholder="Ej. Matemáticas"
          className={ESTILO_INPUT}
        />
        <datalist id="materias-sugeridas">
          {MATERIAS_SUGERIDAS.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
      </label>
      <label className="block">
        <span className={ESTILO_ETIQUETA}>Grado</span>
        <input
          name="grado"
          required
          maxLength={40}
          list="grados-clase"
          defaultValue={clase?.grado}
          placeholder="Ej. 7mo A"
          className={ESTILO_INPUT}
        />
        <datalist id="grados-clase">
          {grados.map((g) => (
            <option key={g} value={g} />
          ))}
        </datalist>
      </label>
      <label className="block">
        <span className={ESTILO_ETIQUETA}>Maestro</span>
        <select name="maestro_usuario" defaultValue={clase?.maestro_usuario ?? ""} className={ESTILO_INPUT}>
          <option value="">Sin asignar</option>
          {maestros.map((m) => (
            <option key={m.usuario} value={m.usuario}>
              {m.nombre}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className={ESTILO_ETIQUETA}>Horario</span>
        <input
          name="horario"
          maxLength={120}
          defaultValue={clase?.horario ?? ""}
          placeholder="Ej. Lun y Mié - 7:00 a 7:45"
          className={ESTILO_INPUT}
        />
      </label>
      <label className="block">
        <span className={ESTILO_ETIQUETA}>Aula</span>
        <input name="aula" maxLength={120} defaultValue={clase?.aula ?? ""} placeholder="Ej. Aula 12" className={ESTILO_INPUT} />
      </label>
      <label className="block sm:col-span-2 lg:col-span-1">
        <span className={ESTILO_ETIQUETA}>Descripción</span>
        <input
          name="descripcion"
          maxLength={300}
          defaultValue={clase?.descripcion ?? ""}
          placeholder="De qué trata la materia"
          className={ESTILO_INPUT}
        />
      </label>
    </div>
  );
}
