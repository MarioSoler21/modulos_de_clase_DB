import {
  Atom,
  BookMarked,
  BookOpen,
  Calculator,
  Camera,
  Church,
  Code2,
  Compass,
  Cpu,
  Dumbbell,
  Feather,
  FlaskConical,
  Globe2,
  GraduationCap,
  HeartHandshake,
  Landmark,
  Languages,
  Leaf,
  Library,
  Lightbulb,
  Map,
  MessageCircle,
  Microscope,
  Monitor,
  Music,
  Palette,
  PenLine,
  Rocket,
  Shapes,
  Sigma,
  Star,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import type { Clase } from "./tipos";

// Apariencia de cada clase: icono y tema de color. Por defecto se eligen segun el
// nombre de la materia; el maestro puede cambiarlos (columnas clases.icono y clases.tema).
// Las clases de Tailwind estan escritas completas para que el compilador las detecte.

export interface EstiloMateria {
  Icono: LucideIcon;
  degradado: string;
  suave: string;
  texto: string;
  borde: string;
}

type Tema = Omit<EstiloMateria, "Icono"> & { nombre: string; muestra: string };

export const TEMAS: Record<string, Tema> = {
  azul: { nombre: "Azul institucional", muestra: "bg-marca-700", degradado: "from-marca-700 to-marca-500", suave: "bg-marca-50", texto: "text-marca-700", borde: "border-marca-200" },
  verde: { nombre: "Verde institucional", muestra: "bg-bosque-700", degradado: "from-bosque-700 to-bosque-500", suave: "bg-bosque-50", texto: "text-bosque-700", borde: "border-bosque-200" },
  rosa: { nombre: "Rosa", muestra: "bg-rose-600", degradado: "from-rose-600 to-rose-400", suave: "bg-rose-50", texto: "text-rose-700", borde: "border-rose-200" },
  violeta: { nombre: "Violeta", muestra: "bg-violet-600", degradado: "from-violet-600 to-violet-400", suave: "bg-violet-50", texto: "text-violet-700", borde: "border-violet-200" },
  ambar: { nombre: "Ámbar", muestra: "bg-amber-500", degradado: "from-amber-600 to-amber-400", suave: "bg-amber-50", texto: "text-amber-700", borde: "border-amber-200" },
  celeste: { nombre: "Celeste", muestra: "bg-sky-600", degradado: "from-sky-600 to-cyan-500", suave: "bg-sky-50", texto: "text-sky-700", borde: "border-sky-200" },
  naranja: { nombre: "Naranja", muestra: "bg-orange-500", degradado: "from-orange-600 to-orange-400", suave: "bg-orange-50", texto: "text-orange-700", borde: "border-orange-200" },
  fucsia: { nombre: "Fucsia", muestra: "bg-fuchsia-600", degradado: "from-fuchsia-600 to-pink-500", suave: "bg-fuchsia-50", texto: "text-fuchsia-700", borde: "border-fuchsia-200" },
  turquesa: { nombre: "Turquesa", muestra: "bg-teal-600", degradado: "from-teal-600 to-emerald-500", suave: "bg-teal-50", texto: "text-teal-700", borde: "border-teal-200" },
  grafito: { nombre: "Grafito", muestra: "bg-slate-700", degradado: "from-slate-700 to-slate-500", suave: "bg-slate-100", texto: "text-slate-700", borde: "border-slate-200" },
};

export const ICONOS: Record<string, { Icono: LucideIcon; nombre: string }> = {
  calculadora: { Icono: Calculator, nombre: "Calculadora" },
  sigma: { Icono: Sigma, nombre: "Sumatoria" },
  figuras: { Icono: Shapes, nombre: "Figuras" },
  libro: { Icono: BookOpen, nombre: "Libro abierto" },
  marcador: { Icono: BookMarked, nombre: "Libro" },
  lapiz: { Icono: PenLine, nombre: "Escritura" },
  idiomas: { Icono: Languages, nombre: "Idiomas" },
  conversacion: { Icono: MessageCircle, nombre: "Conversación" },
  biblioteca: { Icono: Library, nombre: "Biblioteca" },
  pluma: { Icono: Feather, nombre: "Pluma" },
  computadora: { Icono: Monitor, nombre: "Computadora" },
  codigo: { Icono: Code2, nombre: "Programación" },
  procesador: { Icono: Cpu, nombre: "Tecnología" },
  laboratorio: { Icono: FlaskConical, nombre: "Laboratorio" },
  microscopio: { Icono: Microscope, nombre: "Microscopio" },
  hoja: { Icono: Leaf, nombre: "Naturaleza" },
  atomo: { Icono: Atom, nombre: "Átomo" },
  mundo: { Icono: Globe2, nombre: "Mundo" },
  historia: { Icono: Landmark, nombre: "Historia" },
  mapa: { Icono: Map, nombre: "Mapa" },
  brujula: { Icono: Compass, nombre: "Brújula" },
  musica: { Icono: Music, nombre: "Música" },
  arte: { Icono: Palette, nombre: "Arte" },
  camara: { Icono: Camera, nombre: "Fotografía" },
  deporte: { Icono: Dumbbell, nombre: "Deporte" },
  trofeo: { Icono: Trophy, nombre: "Trofeo" },
  iglesia: { Icono: Church, nombre: "Religión" },
  valores: { Icono: HeartHandshake, nombre: "Valores" },
  idea: { Icono: Lightbulb, nombre: "Idea" },
  cohete: { Icono: Rocket, nombre: "Cohete" },
  estrella: { Icono: Star, nombre: "Estrella" },
  birrete: { Icono: GraduationCap, nombre: "Birrete" },
};

// Icono y tema por defecto segun palabras clave del nombre de la materia.
const POR_MATERIA: { clave: string; icono: string; tema: string }[] = [
  { clave: "matem", icono: "calculadora", tema: "azul" },
  { clave: "espan", icono: "libro", tema: "rosa" },
  { clave: "ingl", icono: "idiomas", tema: "violeta" },
  { clave: "liter", icono: "biblioteca", tema: "ambar" },
  { clave: "comput", icono: "computadora", tema: "celeste" },
  { clave: "inform", icono: "computadora", tema: "celeste" },
  { clave: "cienc", icono: "laboratorio", tema: "verde" },
  { clave: "biolog", icono: "laboratorio", tema: "verde" },
  { clave: "social", icono: "mundo", tema: "naranja" },
  { clave: "histor", icono: "historia", tema: "naranja" },
  { clave: "music", icono: "musica", tema: "fucsia" },
  { clave: "arte", icono: "arte", tema: "fucsia" },
  { clave: "fisica", icono: "deporte", tema: "turquesa" },
  { clave: "moral", icono: "valores", tema: "turquesa" },
  { clave: "relig", icono: "iglesia", tema: "turquesa" },
];

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function aparienciaPorDefecto(nombre: string): { icono: string; tema: string } {
  const n = normalizar(nombre);
  const m = POR_MATERIA.find((p) => n.includes(p.clave));
  return { icono: m?.icono ?? "birrete", tema: m?.tema ?? "grafito" };
}

// Estilo de una clase: lo que eligio el maestro o, si no eligio, lo de su materia.
export function estiloClase(clase: Pick<Clase, "nombre"> & Partial<Pick<Clase, "icono" | "tema">>): EstiloMateria {
  const defecto = aparienciaPorDefecto(clase.nombre);
  const icono = ICONOS[clase.icono ?? ""] ?? ICONOS[defecto.icono];
  const { nombre: _n, muestra: _m, ...tema } = TEMAS[clase.tema ?? ""] ?? TEMAS[defecto.tema];
  return { Icono: icono.Icono, ...tema };
}

// Compatibilidad: estilo solo a partir del nombre de la materia.
export function estiloMateria(nombre: string): EstiloMateria {
  return estiloClase({ nombre });
}
