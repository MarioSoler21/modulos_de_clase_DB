import Encabezado from "@/components/Encabezado";
import { SesionProvider } from "@/components/SesionProvider";
import { requerirRol } from "@/lib/sesion";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const usuario = await requerirRol("admin");
  return (
    <SesionProvider usuario={usuario}>
      <Encabezado />
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </SesionProvider>
  );
}
