"use client";

import { ESTILO_INPUT, ESTILO_ETIQUETA } from "@/lib/formulario";
import { useState } from "react";
import type { Rol } from "@/lib/tipos";

// Campos del formulario de alta: el grado solo aparece para estudiantes.
export default function CamposUsuarioNuevo({ rolInicial, grados }: { rolInicial: Rol; grados: string[] }) {
  const [rol, setRol] = useState<Rol>(rolInicial);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <label className="block">
        <span className={ESTILO_ETIQUETA}>Rol</span>
        <select name="rol" value={rol} onChange={(e) => setRol(e.target.value as Rol)} className={ESTILO_INPUT}>
          <option value="estudiante">Alumno</option>
          <option value="maestro">Maestro</option>
          <option value="admin">Administrador</option>
        </select>
      </label>
      <label className="block">
        <span className={ESTILO_ETIQUETA}>Nombre completo</span>
        <input name="nombre" required maxLength={120} className={ESTILO_INPUT} />
      </label>
      <label className="block">
        <span className={ESTILO_ETIQUETA}>Usuario</span>
        <input
          name="usuario"
          required
          pattern="[a-z0-9._\-]{3,40}"
          title="3 a 40 caracteres: letras minúsculas, números, punto o guion"
          autoComplete="off"
          className={ESTILO_INPUT}
        />
      </label>
      <label className="block">
        <span className={ESTILO_ETIQUETA}>Clave</span>
        <input name="clave" type="text" required minLength={6} autoComplete="off" className={ESTILO_INPUT} />
      </label>
      {rol === "estudiante" && (
        <label className="block">
          <span className={ESTILO_ETIQUETA}>Grado</span>
          <input name="grado" required maxLength={40} list="grados-nuevo" placeholder="Ej. 7mo A" className={ESTILO_INPUT} />
          <datalist id="grados-nuevo">
            {grados.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>
        </label>
      )}
    </div>
  );
}
