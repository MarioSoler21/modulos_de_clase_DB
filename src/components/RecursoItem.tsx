import {
  ExternalLink,
  FileSpreadsheet,
  FileText,
  FileType2,
  ImageIcon,
  Link2,
  Megaphone,
  PlayCircle,
  type LucideIcon,
} from "lucide-react";
import { ETIQUETA_TIPO, esDocumento, urlEmbed } from "@/lib/recursos";
import type { Recurso, TipoRecurso } from "@/lib/tipos";

const ESTILO_TIPO: Record<TipoRecurso, { Icono: LucideIcon; clase: string }> = {
  pdf: { Icono: FileText, clase: "bg-red-50 text-red-600" },
  doc: { Icono: FileType2, clase: "bg-marca-50 text-marca-700" },
  excel: { Icono: FileSpreadsheet, clase: "bg-bosque-50 text-bosque-700" },
  imagen: { Icono: ImageIcon, clase: "bg-violet-50 text-violet-700" },
  video: { Icono: PlayCircle, clase: "bg-orange-50 text-orange-600" },
  enlace: { Icono: Link2, clase: "bg-sky-50 text-sky-700" },
  anuncio: { Icono: Megaphone, clase: "bg-amber-100 text-amber-700" },
};

function IconoTipo({ tipo }: { tipo: TipoRecurso }) {
  const { Icono, clase } = ESTILO_TIPO[tipo];
  return (
    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${clase}`}>
      <Icono className="h-5 w-5" />
    </span>
  );
}

const ESTILO_BOTON =
  "inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-marca-300 hover:text-marca-700";

export default function RecursoItem({ recurso }: { recurso: Recurso }) {
  const r = recurso;

  if (r.tipo === "anuncio") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-3">
        <IconoTipo tipo="anuncio" />
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Anuncio</p>
          <p className="whitespace-pre-line text-sm font-medium text-slate-800">{r.titulo}</p>
        </div>
      </div>
    );
  }

  if (r.tipo === "video" && r.video_url) {
    const embed = urlEmbed(r.video_url);
    return (
      <div className="rounded-2xl border border-slate-200 p-3">
        <div className="mb-3 flex items-center gap-3">
          <IconoTipo tipo="video" />
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-orange-600">Video</p>
            <p className="truncate text-sm font-semibold text-slate-800">{r.titulo}</p>
          </div>
        </div>
        {embed ? (
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
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
          <a href={r.video_url} target="_blank" rel="noopener noreferrer" className={ESTILO_BOTON}>
            <ExternalLink className="h-4 w-4" /> Ver video en el sitio original
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3 transition hover:border-slate-300">
      <IconoTipo tipo={r.tipo} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{ETIQUETA_TIPO[r.tipo]}</p>
        <p className="truncate text-sm font-semibold text-slate-800">{r.titulo}</p>
      </div>
      {esDocumento(r.tipo) && (
        <a href={`/api/signed-url?recurso=${r.id}`} target="_blank" rel="noopener" className={ESTILO_BOTON}>
          Abrir
        </a>
      )}
      {r.tipo === "enlace" && r.video_url && (
        <a href={r.video_url} target="_blank" rel="noopener noreferrer" className={ESTILO_BOTON}>
          <ExternalLink className="h-4 w-4" /> Ir al enlace
        </a>
      )}
    </div>
  );
}
