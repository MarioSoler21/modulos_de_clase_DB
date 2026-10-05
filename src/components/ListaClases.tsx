import Link from "next/link";
import type { Clase } from "@/lib/tipos";

export default function ListaClases({
  clases,
  base,
  vacio,
}: {
  clases: Clase[];
  base: string;
  vacio: string;
}) {
  if (clases.length === 0) {
    return <p className="rounded-md border border-dashed border-slate-300 p-6 text-slate-500">{vacio}</p>;
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {clases.map((c) => (
        <li key={c.id}>
          <Link
            href={`${base}/clase/${c.id}`}
            className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-blue-400"
          >
            <span className="block font-medium">{c.nombre}</span>
            <span className="text-sm text-slate-500">{c.grado}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
