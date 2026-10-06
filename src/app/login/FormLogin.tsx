"use client";

import { useActionState, useState } from "react";
import { CircleAlert, Eye, EyeOff, LockKeyhole, LogIn, UserRound } from "lucide-react";
import { ESTILO_BOTON } from "@/lib/formulario";
import { iniciarSesion, type EstadoLogin } from "./actions";

const ESTILO_CAMPO =
  "w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm shadow-sm outline-none transition placeholder:text-slate-400 focus:border-marca-600 focus:ring-4 focus:ring-marca-100";

export default function FormLogin() {
  const [estado, accion, enviando] = useActionState<EstadoLogin, FormData>(iniciarSesion, {});
  const [verClave, setVerClave] = useState(false);

  return (
    <form action={accion} className="space-y-4">
      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Usuario</span>
        <span className="relative mt-1 block">
          <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input name="usuario" required autoComplete="username" placeholder="Ej. alumno1" className={ESTILO_CAMPO} />
        </span>
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Clave</span>
        <span className="relative mt-1 block">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            name="clave"
            type={verClave ? "text" : "password"}
            required
            autoComplete="current-password"
            className={`${ESTILO_CAMPO} pr-10`}
          />
          <button
            type="button"
            onClick={() => setVerClave((v) => !v)}
            aria-label={verClave ? "Ocultar clave" : "Mostrar clave"}
            className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            {verClave ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </span>
      </label>
      {estado.error && (
        <p className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          <CircleAlert className="h-4 w-4 shrink-0" />
          {estado.error}
        </p>
      )}
      <button type="submit" disabled={enviando} className={`${ESTILO_BOTON} w-full py-2.5`}>
        <LogIn className="h-4 w-4" />
        {enviando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
