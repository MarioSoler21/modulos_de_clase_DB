import Plataforma from "@/components/Plataforma";
import { requerirRol } from "@/lib/sesion";

export default async function EstudianteLayout({ children }: { children: React.ReactNode }) {
  const usuario = await requerirRol("estudiante");
  return <Plataforma usuario={usuario}>{children}</Plataforma>;
}
