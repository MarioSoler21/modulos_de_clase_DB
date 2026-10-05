"use client";

import { useActionState, useEffect, useRef } from "react";
import { crearModulo, type EstadoForm } from "@/app/maestro/clase/[id]/actions";

const ESTILO_INPUT = "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600";

export default function FormModulo({ claseId, siguienteOrden }: { claseId: string; siguienteOrden: number }) {
  const [estado, accion, enviando] = useActionState<EstadoForm, FormData>(crearModulo.bind(null, claseId), {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.ok) formRef.current?.reset();
  }, [estado.ok]);

  return (
    <form ref={formRef} action={accion} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_6rem]">
        <label className="block">
          <span className="text-sm font-medium">Titulo</span>
          <input name="titulo" required maxLength={200} className={ESTILO_INPUT} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Orden</span>
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
        <span className="text-sm font-medium">Descripcion</span>
        <textarea name="descripcion" rows={2} maxLength={1000} className={ESTILO_INPUT} />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input name="publicado" type="checkbox" defaultChecked />
        Publicado (visible para estudiantes)
      </label>
      {estado.error && <p className="text-sm text-red-600">{estado.error}</p>}
      <button
        type="submit"
        disabled={enviando}
        className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
      >
        {enviando ? "Creando..." : "Crear modulo"}
      </button>
    </form>
  );
}
