"use client";

import { useActionState, useEffect, useRef } from "react";
import { crearModulo, type EstadoForm } from "@/app/maestro/clase/[id]/actions";
import { ESTILO_BOTON, ESTILO_ETIQUETA, ESTILO_INPUT } from "@/lib/formulario";

export interface OpcionSemana {
  id: string;
  etiqueta: string;
}

export default function FormModulo({
  claseId,
  siguienteOrden,
  semanas,
  semanaPorDefecto,
}: {
  claseId: string;
  siguienteOrden: number;
  semanas: OpcionSemana[];
  semanaPorDefecto: string;
}) {
  const [estado, accion, enviando] = useActionState<EstadoForm, FormData>(crearModulo.bind(null, claseId), {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.ok) formRef.current?.reset();
  }, [estado.ok]);

  return (
    <form ref={formRef} action={accion} className="space-y-3">
      <label className="block">
        <span className={ESTILO_ETIQUETA}>Título</span>
        <input name="titulo" required maxLength={200} className={ESTILO_INPUT} />
      </label>
      <div className="grid grid-cols-[1fr_5.5rem] gap-3">
        <label className="block">
          <span className={ESTILO_ETIQUETA}>Semana</span>
          <select key={semanaPorDefecto} name="semana_id" defaultValue={semanaPorDefecto} className={ESTILO_INPUT}>
            <option value="">Sin semana</option>
            {semanas.map((s) => (
              <option key={s.id} value={s.id}>
                {s.etiqueta}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={ESTILO_ETIQUETA}>Orden</span>
          <input
            key={siguienteOrden}
            name="orden"
            type="number"
            min={0}
            required
            defaultValue={siguienteOrden}
            className={ESTILO_INPUT}
          />
        </label>
      </div>
      <label className="block">
        <span className={ESTILO_ETIQUETA}>Descripción</span>
        <textarea name="descripcion" rows={2} maxLength={1000} className={ESTILO_INPUT} />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input name="publicado" type="checkbox" defaultChecked />
        Publicado (visible para estudiantes)
      </label>
      {estado.error && <p className="text-sm text-red-600">{estado.error}</p>}
      <button type="submit" disabled={enviando} className={ESTILO_BOTON}>
        {enviando ? "Creando..." : "Crear módulo"}
      </button>
    </form>
  );
}
