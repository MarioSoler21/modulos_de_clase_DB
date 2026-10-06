import Link from "next/link";
import { ArrowLeft, type LucideIcon } from "lucide-react";

// Piezas visuales compartidas (componentes de servidor, sin estado).

export function Volver({ href, texto = "Volver" }: { href: string; texto?: string }) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-marca-700"
    >
      <ArrowLeft className="h-4 w-4" />
      {texto}
    </Link>
  );
}

export function TituloPagina({
  icono: Icono,
  titulo,
  subtitulo,
  acciones,
}: {
  icono?: LucideIcon;
  titulo: React.ReactNode;
  subtitulo?: React.ReactNode;
  acciones?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-center gap-4">
        {Icono && (
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-marca-700 text-white shadow-elevada">
            <Icono className="h-6 w-6" />
          </span>
        )}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{titulo}</h1>
          {subtitulo && <p className="mt-0.5 text-slate-500">{subtitulo}</p>}
        </div>
      </div>
      {acciones && <div className="flex flex-wrap items-center gap-2">{acciones}</div>}
    </div>
  );
}

const TONOS = {
  marca: "bg-marca-50 text-marca-700",
  bosque: "bg-bosque-50 text-bosque-700",
  ambar: "bg-amber-50 text-amber-700",
  rosa: "bg-rose-50 text-rose-700",
  violeta: "bg-violet-50 text-violet-700",
  gris: "bg-slate-100 text-slate-600",
};
export type Tono = keyof typeof TONOS;

export function Estadistica({
  icono: Icono,
  etiqueta,
  valor,
  detalle,
  tono = "marca",
}: {
  icono: LucideIcon;
  etiqueta: string;
  valor: React.ReactNode;
  detalle?: React.ReactNode;
  tono?: Tono;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-tarjeta">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{etiqueta}</p>
        <span className={`grid h-9 w-9 place-items-center rounded-xl ${TONOS[tono]}`}>
          <Icono className="h-[18px] w-[18px]" />
        </span>
      </div>
      <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{valor}</p>
      {detalle && <p className="mt-1 text-xs text-slate-500">{detalle}</p>}
    </div>
  );
}

export function Tarjeta({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-slate-200/80 bg-white shadow-tarjeta ${className}`}>{children}</section>
  );
}

export function TituloSeccion({
  icono: Icono,
  children,
  acciones,
}: {
  icono?: LucideIcon;
  children: React.ReactNode;
  acciones?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
        {Icono && <Icono className="h-5 w-5 text-marca-700" />}
        {children}
      </h2>
      {acciones}
    </div>
  );
}

export function Vacio({ icono: Icono, children }: { icono: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center text-slate-500">
      <Icono className="h-8 w-8 text-slate-300" />
      <div className="max-w-md text-sm">{children}</div>
    </div>
  );
}

export function iniciales(nombre: string): string {
  return nombre
    .replace(/^Prof\.\s*/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

const COLORES_AVATAR = [
  "bg-marca-100 text-marca-800",
  "bg-bosque-100 text-bosque-800",
  "bg-amber-100 text-amber-800",
  "bg-rose-100 text-rose-800",
  "bg-violet-100 text-violet-800",
  "bg-sky-100 text-sky-800",
];

export function Avatar({ nombre, tamano = "md" }: { nombre: string; tamano?: "sm" | "md" }) {
  const indice = [...nombre].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORES_AVATAR.length;
  const medida = tamano === "sm" ? "h-7 w-7 text-[11px]" : "h-9 w-9 text-xs";
  return (
    <span className={`grid shrink-0 place-items-center rounded-full font-bold ${medida} ${COLORES_AVATAR[indice]}`}>
      {iniciales(nombre)}
    </span>
  );
}

export function saludo(): string {
  const hora = Number(
    new Date().toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: "America/Tegucigalpa" }),
  );
  return hora < 12 ? "Buenos días" : hora < 18 ? "Buenas tardes" : "Buenas noches";
}
