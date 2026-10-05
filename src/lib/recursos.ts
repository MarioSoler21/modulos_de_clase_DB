// Reglas de los recursos compartidas por el formulario (cliente) y la API (servidor).

import type { TipoRecurso } from "./tipos";

export const MAX_BYTES = 10 * 1024 * 1024;

export const ETIQUETA_TIPO: Record<TipoRecurso, string> = {
  pdf: "PDF",
  doc: "Word",
  excel: "Excel",
  imagen: "Imagen",
  video: "Video",
  enlace: "Enlace",
  anuncio: "Anuncio",
};

// Extensiones permitidas por tipo de documento y el content-type con que se guardan.
export const EXTENSIONES: Partial<Record<TipoRecurso, Record<string, string>>> = {
  pdf: { pdf: "application/pdf" },
  doc: {
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
  excel: {
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
  imagen: { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp" },
};

export function esDocumento(tipo: TipoRecurso): boolean {
  return tipo in EXTENSIONES;
}

export function extension(nombre: string): string {
  return nombre.split(".").pop()?.toLowerCase() ?? "";
}

export function acceptDe(tipo: TipoRecurso): string {
  return Object.keys(EXTENSIONES[tipo] ?? {})
    .map((e) => "." + e)
    .join(",");
}

export function esUrlValida(valor: string): boolean {
  try {
    const u = new URL(valor);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// Convierte una URL de YouTube o Vimeo a su version embebible. Null si no se reconoce.
export function urlEmbed(valor: string): string | null {
  let u: URL;
  try {
    u = new URL(valor);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\.|^m\./, "");
  let id: string | null = null;

  if (host === "youtu.be") id = u.pathname.slice(1);
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (u.pathname === "/watch") id = u.searchParams.get("v");
    else id = u.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1] ?? null;
  }
  if (id && /^[\w-]{6,}$/.test(id)) return `https://www.youtube-nocookie.com/embed/${id}`;

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const vid = u.pathname.match(/(\d{6,})/)?.[1];
    if (vid) return `https://player.vimeo.com/video/${vid}`;
  }
  return null;
}

export function esUuid(valor: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(valor);
}
