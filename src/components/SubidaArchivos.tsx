"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { CircleAlert, CircleCheck, LoaderCircle, UploadCloud } from "lucide-react";
import { ACCEPT_DOCUMENTOS, ETIQUETA_TIPO, MAX_BYTES, tipoPorExtension, tituloDesdeArchivo } from "@/lib/recursos";

interface Fila {
  nombre: string;
  estado: "pendiente" | "subiendo" | "listo" | "error";
  detalle?: string;
}

// Zona para arrastrar o elegir varios archivos a la vez. El tipo (PDF, Word, Excel,
// imagen) se detecta por la extension y el titulo se toma del nombre del archivo.
export default function SubidaArchivos({ moduloId }: { moduloId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [filas, setFilas] = useState<Fila[]>([]);
  const [arrastrando, setArrastrando] = useState(false);
  const [ocupado, setOcupado] = useState(false);

  async function subir(archivos: File[]) {
    if (ocupado || archivos.length === 0) return;
    setOcupado(true);
    const lista: Fila[] = archivos.map((a) => ({ nombre: a.name, estado: "pendiente" }));
    setFilas(lista);
    const actualizar = (i: number, cambio: Partial<Fila>) =>
      setFilas((prev) => prev.map((f, j) => (j === i ? { ...f, ...cambio } : f)));

    let subidos = 0;
    for (const [i, archivo] of archivos.entries()) {
      const tipo = tipoPorExtension(archivo.name);
      if (!tipo) {
        actualizar(i, { estado: "error", detalle: "formato no permitido" });
        continue;
      }
      if (archivo.size > MAX_BYTES) {
        actualizar(i, { estado: "error", detalle: "supera 10MB" });
        continue;
      }
      actualizar(i, { estado: "subiendo", detalle: ETIQUETA_TIPO[tipo] });
      const datos = new FormData();
      datos.append("modulo_id", moduloId);
      datos.append("tipo", tipo);
      datos.append("titulo", tituloDesdeArchivo(archivo.name));
      datos.append("archivo", archivo);
      try {
        const res = await fetch("/api/recursos", { method: "POST", body: datos });
        const json = await res.json().catch(() => ({}));
        if (res.ok) {
          subidos++;
          actualizar(i, { estado: "listo", detalle: ETIQUETA_TIPO[tipo] });
        } else {
          actualizar(i, { estado: "error", detalle: json.error ?? "error al subir" });
        }
      } catch {
        actualizar(i, { estado: "error", detalle: "error de conexión" });
      }
    }

    setOcupado(false);
    if (inputRef.current) inputRef.current.value = "";
    if (subidos > 0) router.refresh();
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setArrastrando(true);
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastrando(false);
          subir([...e.dataTransfer.files]);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center text-sm transition-colors ${
          arrastrando ? "border-marca-500 bg-marca-50" : "border-slate-300 bg-white hover:border-marca-400 hover:bg-marca-50/40"
        }`}
      >
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-marca-50 text-marca-700">
          {ocupado ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
        </span>
        <p className="font-semibold text-slate-700">
          {ocupado ? "Subiendo archivos..." : "Arrastra archivos aquí o haz clic para elegirlos"}
        </p>
        <p className="mt-1 text-xs text-slate-500">PDF, Word, Excel o imágenes. Varios a la vez, máximo 10MB cada uno.</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT_DOCUMENTOS}
          className="hidden"
          onChange={(e) => subir([...(e.target.files ?? [])])}
        />
      </div>

      {filas.length > 0 && (
        <ul className="mt-2 space-y-1 text-sm">
          {filas.map((f, i) => (
            <li key={i} className="flex items-center justify-between gap-3">
              <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
                {f.estado === "listo" ? <CircleCheck className="h-4 w-4 shrink-0 text-bosque-600" /> : f.estado === "error" ? <CircleAlert className="h-4 w-4 shrink-0 text-red-600" /> : <LoaderCircle className="h-4 w-4 shrink-0 animate-spin text-slate-400" />}
                {f.nombre}
              </span>
              <span
                className={`shrink-0 text-xs ${
                  f.estado === "error" ? "text-red-600" : f.estado === "listo" ? "text-green-700" : "text-slate-500"
                }`}
              >
                {f.estado === "pendiente" && "En espera"}
                {f.estado === "subiendo" && "Subiendo..."}
                {f.estado === "listo" && `Listo (${f.detalle})`}
                {f.estado === "error" && `Error: ${f.detalle}`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
