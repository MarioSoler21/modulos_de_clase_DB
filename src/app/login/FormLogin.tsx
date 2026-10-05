"use client";

import { useActionState } from "react";
import { iniciarSesion, type EstadoLogin } from "./actions";

export default function FormLogin() {
  const [estado, accion, enviando] = useActionState<EstadoLogin, FormData>(iniciarSesion, {});

  return (
    <form action={accion} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium">Usuario</span>
        <input
          name="usuario"
          required
          autoComplete="username"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Clave</span>
        <input
          name="clave"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600"
        />
      </label>
      {estado.error && <p className="text-sm text-red-600">{estado.error}</p>}
      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-md bg-blue-700 px-3 py-2 font-medium text-white hover:bg-blue-800 disabled:opacity-60"
      >
        {enviando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
