import { colorDe } from "@/lib/decoracion";
import type { Modulo } from "@/lib/tipos";

// Cabecera del modulo con su color y, si tiene, la imagen de portada.
export default function ModuloEncabezado({
  modulo,
  portadaUrl,
  acciones,
}: {
  modulo: Modulo;
  portadaUrl?: string;
  acciones?: React.ReactNode;
}) {
  const c = colorDe(modulo.color);
  return (
    <>
      {portadaUrl ? (
        <div className={`relative h-36 w-full overflow-hidden sm:h-44 ${c.banda}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={portadaUrl} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
          <div className={`absolute inset-x-0 bottom-0 h-1.5 ${c.banda}`} />
        </div>
      ) : (
        <div className={`h-1.5 w-full ${c.banda}`} />
      )}
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-4">
        <div className="flex items-start gap-3">
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-extrabold text-white ${c.banda}`}>
            {modulo.orden}
          </span>
          <div>
            <h3 className={`text-lg font-bold leading-tight ${c.texto}`}>{modulo.titulo}</h3>
            {modulo.descripcion && <p className="mt-0.5 text-sm text-slate-600">{modulo.descripcion}</p>}
          </div>
        </div>
        {acciones}
      </div>
    </>
  );
}
