import { redirect } from "next/navigation";
import { BookOpenCheck, ClipboardCheck, Layers, MapPin, ShieldCheck } from "lucide-react";
import { obtenerSesion, rutaInicio } from "@/lib/sesion";
import FormLogin from "./FormLogin";

export const metadata = { title: "Iniciar sesión" };

const PUNTOS = [
  { Icono: Layers, titulo: "Módulos por materia", texto: "Material organizado por clase: guías, lecturas, videos y anuncios." },
  { Icono: ClipboardCheck, titulo: "Tareas y calificaciones", texto: "Entrega tus tareas en línea y consulta tus notas y promedios." },
  { Icono: ShieldCheck, titulo: "Acceso seguro", texto: "Cada estudiante ve solo las clases en las que está inscrito." },
];

export default async function LoginPage() {
  const u = await obtenerSesion();
  if (u) redirect(rutaInicio(u.rol));

  return (
    <main className="fondo-marca relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="patron-puntos pointer-events-none absolute inset-0" />
      <div className="relative grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div className="hidden text-white lg:block">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium ring-1 ring-white/20">
            <MapPin className="h-4 w-4" /> San Pedro Sula, Honduras
          </p>
          <h1 className="mt-5 text-5xl font-extrabold leading-tight tracking-tight">
            Aula virtual del
            <br />
            Instituto Don Bosco
          </h1>
          <p className="mt-4 max-w-md text-lg text-white/80">
            El espacio donde maestros y estudiantes de secundaria comparten el material de cada clase.
          </p>
          <ul className="mt-8 space-y-5">
            {PUNTOS.map(({ Icono, titulo, texto }) => (
              <li key={titulo} className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 ring-1 ring-white/20">
                  <Icono className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold">{titulo}</p>
                  <p className="text-sm text-white/70">{texto}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl sm:p-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-don-bosco.png" alt="Instituto Don Bosco, San Pedro Sula, Honduras" className="mx-auto h-auto w-64" />
          <div className="mt-8 mb-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <BookOpenCheck className="h-5 w-5 text-bosque-700" />
              Iniciar sesión
            </h2>
            <p className="mt-1 text-sm text-slate-500">Ingresa con el usuario y la clave que te dio la administración.</p>
          </div>
          <FormLogin />
          <p className="mt-8 text-center text-xs text-slate-400">
            Instituto Don Bosco - Educación salesiana desde San Pedro Sula
          </p>
        </div>
      </div>
    </main>
  );
}
