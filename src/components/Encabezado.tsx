"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, School, Users, type LucideIcon } from "lucide-react";
import { cerrarSesion } from "@/app/login/actions";
import { rutaInicio } from "@/lib/rutas";
import type { Rol } from "@/lib/tipos";
import { useSesion } from "./SesionProvider";

const ETIQUETA_ROL: Record<Rol, string> = { admin: "Administrador", maestro: "Docente", estudiante: "Estudiante" };

const MENU: Record<Rol, { href: string; texto: string; Icono: LucideIcon; exacto?: boolean }[]> = {
  admin: [
    { href: "/admin", texto: "Inicio", Icono: LayoutDashboard, exacto: true },
    { href: "/admin/clases", texto: "Clases", Icono: School },
    { href: "/admin/usuarios", texto: "Usuarios", Icono: Users },
  ],
  maestro: [{ href: "/maestro", texto: "Mis clases", Icono: School }],
  estudiante: [{ href: "/estudiante", texto: "Mis clases", Icono: School }],
};

function iniciales(nombre: string) {
  return nombre
    .replace(/^Prof\.\s*/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function Encabezado() {
  const u = useSesion();
  const ruta = usePathname();
  const menu = MENU[u.rol];

  function salir() {
    try {
      localStorage.removeItem("sesion");
    } catch {
      // Sin localStorage no hay nada que limpiar.
    }
  }

  const activo = (href: string, exacto?: boolean) => (exacto ? ruta === href : ruta.startsWith(href));

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-6">
          <Link href={rutaInicio(u.rol)} className="flex shrink-0 items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/escudo-don-bosco.png" alt="" className="h-10 w-auto" />
            <span className="hidden leading-tight sm:block">
              <span className="block text-[15px] font-extrabold tracking-tight text-marca-700">Instituto Don Bosco</span>
              <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-bosque-700">
                Aula virtual
              </span>
            </span>
          </Link>
          <nav className="flex gap-1 overflow-x-auto text-sm">
            {menu.map(({ href, texto, Icono, exacto }) => (
              <Link
                key={href}
                href={href}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 font-semibold transition ${
                  activo(href, exacto)
                    ? "bg-marca-50 text-marca-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icono className="h-4 w-4" />
                {texto}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2.5 md:flex">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-marca-700 to-bosque-700 text-xs font-bold text-white">
              {iniciales(u.nombre)}
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold text-slate-800">{u.nombre}</span>
              <span className="block text-xs text-slate-500">
                {ETIQUETA_ROL[u.rol]}
                {u.grado ? ` - ${u.grado}` : ""}
              </span>
            </span>
          </div>
          <form action={cerrarSesion} onSubmit={salir}>
            <button
              type="submit"
              title="Cerrar sesión"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </form>
        </div>
      </div>
      <div className="franja-institucional h-1" />
    </header>
  );
}
