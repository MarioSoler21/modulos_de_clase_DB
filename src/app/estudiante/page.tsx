import ListaClases from "@/components/ListaClases";
import { clasesDeEstudiante } from "@/lib/acceso";
import { requerirRol } from "@/lib/sesion";

export default async function EstudiantePage() {
  const u = await requerirRol("estudiante");
  const clases = await clasesDeEstudiante(u.usuario);

  return (
    <>
      <h1 className="mb-4 text-2xl font-semibold">Mis clases</h1>
      <ListaClases clases={clases} base="/estudiante" vacio="Todavia no estas inscrito en ninguna clase." />
    </>
  );
}
