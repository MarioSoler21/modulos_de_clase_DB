"use client";

import { ESTILO_INPUT, ESTILO_BOTON, ESTILO_ETIQUETA } from "@/lib/formulario";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ETIQUETA_TIPO, MAX_BYTES, acceptDe, esDocumento, extension, EXTENSIONES } from "@/lib/recursos";
import type { TipoRecurso } from "@/lib/tipos";

const TIPOS: TipoRecurso[] = ["pdf", "doc", "excel", "imagen", "video", "enlace", "anuncio"];

// Ruteo por tipo: documentos se suben a Storage; video y enlace solo guardan la URL;
// anuncio es solo texto.
export default function FormRecurso({ moduloId }: { moduloId: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [tipo, setTipo] = useState<TipoRecurso>("pdf");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const datos = new FormData(e.currentTarget);

    if (esDocumento(tipo)) {
      const archivo = datos.get("archivo");
      if (!(archivo instanceof File) || archivo.size === 0) return setError("Selecciona un archivo.");
      if (archivo.size > MAX_BYTES) return setError("El archivo supera el límite de 10MB.");
      if (!EXTENSIONES[tipo]?.[extension(archivo.name)]) {
        return setError(`Para ${ETIQUETA_TIPO[tipo]} solo se aceptan: ${acceptDe(tipo)}`);
      }
    }

    setEnviando(true);
    try {
      const res = await fetch("/api/recursos", { method: "POST", body: datos });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "No se pudo guardar el recurso.");
        return;
      }
      formRef.current?.reset();
      setTipo("pdf");
      router.refresh();
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={enviar} className="space-y-3">
      <input type="hidden" name="modulo_id" value={moduloId} />
      <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
        <label className="block">
          <span className={ESTILO_ETIQUETA}>Tipo</span>
          <select
            name="tipo"
            value={tipo}
            onChange={(e) => {
              setTipo(e.target.value as TipoRecurso);
              setError(null);
            }}
            className={ESTILO_INPUT}
          >
            {TIPOS.map((t) => (
              <option key={t} value={t}>
                {ETIQUETA_TIPO[t]}
              </option>
            ))}
          </select>
        </label>
        {tipo !== "anuncio" && (
          <label className="block">
            <span className={ESTILO_ETIQUETA}>Título</span>
            <input name="titulo" required maxLength={200} className={ESTILO_INPUT} />
          </label>
        )}
      </div>

      {esDocumento(tipo) && (
        <label className="block">
          <span className={ESTILO_ETIQUETA}>Archivo ({acceptDe(tipo)}, máximo 10MB)</span>
          <input key={tipo} name="archivo" type="file" accept={acceptDe(tipo)} required className="mt-1 block w-full text-sm" />
        </label>
      )}

      {(tipo === "video" || tipo === "enlace") && (
        <label className="block">
          <span className={ESTILO_ETIQUETA}>
            {tipo === "video" ? "URL del video (YouTube o Vimeo)" : "URL del enlace"}
          </span>
          <input
            name="url"
            type="url"
            required
            placeholder={tipo === "video" ? "https://www.youtube.com/watch?v=..." : "https://..."}
            className={ESTILO_INPUT}
          />
        </label>
      )}

      {tipo === "anuncio" && (
        <label className="block">
          <span className={ESTILO_ETIQUETA}>Texto del anuncio</span>
          <textarea name="titulo" required rows={3} maxLength={500} className={ESTILO_INPUT} />
        </label>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={enviando}
        className={ESTILO_BOTON}
      >
        {enviando ? (esDocumento(tipo) ? "Subiendo..." : "Guardando...") : "Agregar recurso"}
      </button>
    </form>
  );
}
