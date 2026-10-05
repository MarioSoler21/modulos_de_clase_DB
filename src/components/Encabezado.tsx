"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cerrarSesion } from "@/app/login/actions";
import { rutaInicio } from "@/lib/rutas";
import { useSesion } from "./SesionProvider";

const ETIQUETA_ROL = { admin: "Administrador", maestro: "Maestro", estudiante: "Estudiante" };

const MENU_ADMIN = [
  { href: "/admin/clases", texto: "Clases" },
  { href: "/admin/usuarios", texto: "Usuarios" },
];

export default function Encabezado() {
  const u = useSesion();
  const ruta = usePathname();

  function salir() {
    try {
      localStorage.removeItem("sesion");
    } catch {
      // Sin localStorage no hay nada que limpiar.
    }
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href={rutaInicio(u.rol)} className="font-semibold">
            Colegio Don Bosco
          </Link>
          {u.rol === "admin" && (
            <nav className="flex gap-1 text-sm">
              {MENU_ADMIN.map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  className={`rounded-md px-3 py-1 ${
                    ruta.startsWith(m.href) ? "bg-slate-100 font-medium" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {m.texto}
                </Link>
              ))}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-600">
            {u.nombre}
            <span className="text-slate-400">
              {" "}
              - {ETIQUETA_ROL[u.rol]}
              {u.grado ? `, ${u.grado}` : ""}
            </span>
          </span>
          <form action={cerrarSesion} onSubmit={salir}>
            <button type="submit" className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-100">
              Salir
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
