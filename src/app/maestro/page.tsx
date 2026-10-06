import { ClipboardCheck, Layers, School, Users } from "lucide-react";
import ClaseTarjeta from "@/components/ClaseTarjeta";
import { Estadistica, TituloPagina, Vacio, saludo } from "@/components/ui";
import { resumenMaestro } from "@/lib/resumen";
import { requerirRol } from "@/lib/sesion";

export const metadata = { title: "Mis clases" };

export default async function MaestroPage() {
  const u = await requerirRol("maestro");
  const clases = await resumenMaestro(u.usuario);

  const alumnos = clases.reduce((a, c) => a + c.alumnos, 0);
  const porCalificar = clases.reduce((a, c) => a + c.porCalificar, 0);
  const modulos = clases.reduce((a, c) => a + c.modulos, 0);
  const grados = [...new Set(clases.map((c) => c.grado))];

  return (
    <>
      <TituloPagina
        titulo={`${saludo()}, ${u.nombre}`}
        subtitulo="Este es el resumen de tus clases en el aula virtual."
      />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Estadistica icono={School} etiqueta="Clases" valor={clases.length} detalle={grados.join(", ") || "Sin clases"} />
        <Estadistica icono={Users} etiqueta="Alumnos" valor={alumnos} detalle="Inscritos en tus clases" tono="bosque" />
        <Estadistica icono={Layers} etiqueta="Módulos" valor={modulos} detalle="Publicados y borradores" tono="violeta" />
        <Estadistica
          icono={ClipboardCheck}
          etiqueta="Por calificar"
          valor={porCalificar}
          detalle={porCalificar ? "Entregas esperando nota" : "Todo al día"}
          tono={porCalificar ? "ambar" : "bosque"}
        />
      </div>

      <h2 className="mb-4 text-lg font-bold">Mis clases</h2>
      {clases.length === 0 ? (
        <Vacio icono={School}>Todavía no tienes clases asignadas. La administración se encarga de asignarlas.</Vacio>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {clases.map((c) => (
            <ClaseTarjeta key={c.id} clase={c} href={`/maestro/clase/${c.id}`} subtitulo={c.descripcion} />
          ))}
        </div>
      )}
    </>
  );
}
