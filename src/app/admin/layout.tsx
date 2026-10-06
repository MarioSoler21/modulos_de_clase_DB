import Plataforma from "@/components/Plataforma";
import { requerirRol } from "@/lib/sesion";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const usuario = await requerirRol("admin");
  return <Plataforma usuario={usuario}>{children}</Plataforma>;
}
