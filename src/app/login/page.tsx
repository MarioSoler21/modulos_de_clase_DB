import { redirect } from "next/navigation";
import { obtenerSesion, rutaInicio } from "@/lib/sesion";
import FormLogin from "./FormLogin";

export default async function LoginPage() {
  const u = await obtenerSesion();
  if (u) redirect(rutaInicio(u.rol));

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Colegio Don Bosco</h1>
        <p className="mb-6 text-sm text-slate-500">Modulos de clase - Secundaria</p>
        <FormLogin />
      </div>
    </main>
  );
}
