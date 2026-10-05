import { ETIQUETA_TIPO, esDocumento, urlEmbed } from "@/lib/recursos";
import type { Recurso } from "@/lib/tipos";

const COLOR_TIPO: Record<string, string> = {
  pdf: "bg-red-50 text-red-700",
  doc: "bg-blue-50 text-blue-700",
  excel: "bg-green-50 text-green-700",
  imagen: "bg-purple-50 text-purple-700",
  video: "bg-orange-50 text-orange-700",
  enlace: "bg-slate-100 text-slate-700",
  anuncio: "bg-yellow-50 text-yellow-800",
};

function Etiqueta({ tipo }: { tipo: Recurso["tipo"] }) {
  return (
    <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${COLOR_TIPO[tipo]}`}>
      {ETIQUETA_TIPO[tipo]}
    </span>
  );
}

const ESTILO_BOTON = "shrink-0 rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100";

export default function RecursoItem({ recurso }: { recurso: Recurso }) {
  const r = recurso;

  if (r.tipo === "anuncio") {
    return (
      <div className="flex items-start gap-3 rounded-md border border-yellow-200 bg-yellow-50 p-3">
        <Etiqueta tipo={r.tipo} />
        <p className="whitespace-pre-line text-sm">{r.titulo}</p>
      </div>
    );
  }

  if (r.tipo === "video" && r.video_url) {
    const embed = urlEmbed(r.video_url);
    return (
      <div className="rounded-md border border-slate-200 p-3">
        <div className="mb-2 flex items-center gap-3">
          <Etiqueta tipo={r.tipo} />
          <span className="text-sm font-medium">{r.titulo}</span>
        </div>
        {embed ? (
          <div className="aspect-video w-full overflow-hidden rounded bg-black">
            <iframe
              src={embed}
              title={r.titulo}
              className="h-full w-full"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        ) : (
          <a href={r.video_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-700 underline">
            Ver video en el sitio original
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-md border border-slate-200 p-3">
      <Etiqueta tipo={r.tipo} />
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{r.titulo}</span>
      {esDocumento(r.tipo) && (
        <a href={`/api/signed-url?recurso=${r.id}`} target="_blank" rel="noopener" className={ESTILO_BOTON}>
          Abrir
        </a>
      )}
      {r.tipo === "enlace" && r.video_url && (
        <a href={r.video_url} target="_blank" rel="noopener noreferrer" className={ESTILO_BOTON}>
          Ir al enlace
        </a>
      )}
    </div>
  );
}
