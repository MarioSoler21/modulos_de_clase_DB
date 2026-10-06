// Estado que devuelven las server actions de formularios.
export interface EstadoForm {
  error?: string;
  mensaje?: string;
  ok?: number;
}

export type AccionForm = (prev: EstadoForm, form: FormData) => Promise<EstadoForm>;

export const ESTILO_INPUT =
  "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-slate-400 focus:border-marca-600 focus:ring-4 focus:ring-marca-100";
export const ESTILO_BOTON =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-marca-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-marca-800 focus:outline-none focus:ring-4 focus:ring-marca-200 disabled:opacity-60";
export const ESTILO_BOTON_VERDE =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-bosque-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-bosque-800 focus:outline-none focus:ring-4 focus:ring-bosque-200 disabled:opacity-60";
export const ESTILO_BOTON_SECUNDARIO =
  "inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 disabled:opacity-60";
export const ESTILO_BOTON_PELIGRO =
  "inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60";
export const ESTILO_ETIQUETA = "text-sm font-semibold text-slate-700";
