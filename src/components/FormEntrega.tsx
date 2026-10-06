"use client";

import { ESTILO_INPUT, ESTILO_BOTON, ESTILO_ETIQUETA } from "@/lib/formulario";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ACCEPT_DOCUMENTOS, MAX_BYTES } from "@/lib/recursos";

// Formulario del alumno para entregar (o volver a entregar) una tarea.
export default function FormEntrega({ tareaId, yaEntregada }: { tareaId: string; yaEntregada: boolean }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const datos = new FormData(e.currentTarget);
    const archivo = datos.get("archivo");
    const comentario = String(datos.get("comentario") ?? "").trim();
    const hayArchivo = archivo instanceof File && archivo.size > 0;

    if (!hayArchivo && !comentario) return setError("Escribe un comentario o adjunta un archivo.");
    if (hayArchivo && archivo.size > MAX_BYTES) return setError("El archivo supera el límite de 10MB.");

    setEnviando(true);
    try {
      const res = await fetch("/api/entregas", { method: "POST", body: datos });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "No se pudo entregar la tarea.");
        return;
      }
      formRef.current?.reset();
      router.refresh();
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={enviar} className="space-y-2">
      <input type="hidden" name="tarea_id" value={tareaId} />
      <label className="block">
        <span className={ESTILO_ETIQUETA}>Archivo (PDF, Word, Excel o imagen, máximo 10MB)</span>
        <input name="archivo" type="file" accept={ACCEPT_DOCUMENTOS} className="mt-1 block w-full text-sm" />
      </label>
      <label className="block">
        <span className={ESTILO_ETIQUETA}>Comentario para el maestro</span>
        <textarea name="comentario" rows={2} maxLength={2000} className={ESTILO_INPUT} />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={enviando} className={ESTILO_BOTON}>
        {enviando ? "Enviando..." : yaEntregada ? "Volver a entregar" : "Entregar tarea"}
      </button>
    </form>
  );
}
