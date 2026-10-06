"use client";

import { useActionState, useEffect, useRef } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";
import { ESTILO_BOTON, type AccionForm, type EstadoForm } from "@/lib/formulario";

// Formulario generico para server actions: muestra error o mensaje y opcionalmente
// limpia los campos al terminar bien.
export default function FormAccion({
  accion,
  boton,
  enviando: textoEnviando = "Guardando...",
  limpiar = false,
  confirmar,
  estiloBoton = ESTILO_BOTON,
  className = "space-y-3",
  children,
}: {
  accion: AccionForm;
  boton: string;
  enviando?: string;
  limpiar?: boolean;
  confirmar?: string;
  estiloBoton?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const [estado, ejecutar, pendiente] = useActionState<EstadoForm, FormData>(accion, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.ok && limpiar) formRef.current?.reset();
  }, [estado.ok, limpiar]);

  return (
    <form
      ref={formRef}
      action={ejecutar}
      onSubmit={(e) => {
        if (confirmar && !window.confirm(confirmar)) e.preventDefault();
      }}
      className={className}
    >
      {children}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pendiente} className={estiloBoton}>
          {pendiente ? textoEnviando : boton}
        </button>
        {estado.error && (
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600">
            <CircleAlert className="h-4 w-4 shrink-0" />
            {estado.error}
          </p>
        )}
        {!estado.error && estado.mensaje && (
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-bosque-700">
            <CircleCheck className="h-4 w-4 shrink-0" />
            {estado.mensaje}
          </p>
        )}
      </div>
    </form>
  );
}
