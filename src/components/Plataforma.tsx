import Encabezado from "./Encabezado";
import { SesionProvider } from "./SesionProvider";
import type { Usuario } from "@/lib/tipos";

// Marco comun de las areas con sesion: encabezado, contenido y pie.
export default function Plataforma({ usuario, children }: { usuario: Usuario; children: React.ReactNode }) {
  return (
    <SesionProvider usuario={usuario}>
      <div className="flex min-h-screen flex-col">
        <Encabezado />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-slate-500">
            <span>Instituto Don Bosco - San Pedro Sula, Honduras</span>
            <span>Aula virtual - Secundaria</span>
          </div>
        </footer>
      </div>
    </SesionProvider>
  );
}
