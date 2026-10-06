import Plataforma from "@/components/Plataforma";
import { requerirRol } from "@/lib/sesion";

export default async function MaestroLayout({ children }: { children: React.ReactNode }) {
  const usuario = await requerirRol("maestro");
  return <Plataforma usuario={usuario}>{children}</Plataforma>;
}
