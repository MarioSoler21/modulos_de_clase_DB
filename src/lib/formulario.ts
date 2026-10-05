// Estado que devuelven las server actions de formularios.
export interface EstadoForm {
  error?: string;
  mensaje?: string;
  ok?: number;
}

export type AccionForm = (prev: EstadoForm, form: FormData) => Promise<EstadoForm>;

export const ESTILO_INPUT =
  "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600";
export const ESTILO_BOTON =
  "rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60";
export const ESTILO_BOTON_SECUNDARIO =
  "rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100 disabled:opacity-60";
export const ESTILO_BOTON_PELIGRO =
  "rounded-md border border-red-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50 disabled:opacity-60";
