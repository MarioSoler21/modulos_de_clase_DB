"use client";

import { createContext, useContext, useEffect } from "react";
import type { Usuario } from "@/lib/tipos";

// Contexto con el usuario actual. El servidor lo resuelve desde la cookie y lo pasa aqui;
// tambien se copia a localStorage para que este disponible en el cliente.

const SesionContext = createContext<Usuario | null>(null);

export function SesionProvider({ usuario, children }: { usuario: Usuario; children: React.ReactNode }) {
  useEffect(() => {
    try {
      localStorage.setItem("sesion", JSON.stringify(usuario));
    } catch {
      // localStorage puede no estar disponible (modo privado); la cookie sigue funcionando.
    }
  }, [usuario]);

  return <SesionContext.Provider value={usuario}>{children}</SesionContext.Provider>;
}

export function useSesion(): Usuario {
  const u = useContext(SesionContext);
  if (!u) throw new Error("useSesion debe usarse dentro de SesionProvider");
  return u;
}
