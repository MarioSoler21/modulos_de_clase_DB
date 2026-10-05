// Sube al bucket privado "materiales" los PDFs placeholder referenciados en supabase/seed.sql.
// Uso: npm run seed:storage   (lee las variables de .env.local)

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function cargarEnv(archivo) {
  try {
    for (const linea of readFileSync(archivo, "utf8").split(/\r?\n/)) {
      const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    // Si no existe el archivo se usan las variables del entorno.
  }
}

// Genera un PDF minimo de una pagina con un titulo y una linea de texto.
function crearPdf(titulo, texto) {
  const esc = (s) => s.replace(/[\\()]/g, (c) => "\\" + c);
  const contenido =
    `BT /F1 22 Tf 72 720 Td (${esc(titulo)}) Tj ET\n` +
    `BT /F1 12 Tf 72 690 Td (${esc(texto)}) Tj ET\n` +
    `BT /F1 10 Tf 72 670 Td (Colegio Don Bosco - material de ejemplo) Tj ET`;
  const objetos = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${Buffer.byteLength(contenido)} >>\nstream\n${contenido}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [];
  objetos.forEach((obj, i) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf);
}

const ARCHIVOS = [
  {
    path: "seed/guia-numeros-enteros.pdf",
    titulo: "Guia de ejercicios: numeros enteros",
    texto: "Resuelve: (-3) + 5, 7 - (-2), (-4) - 6. Ubica cada resultado en la recta numerica.",
  },
  {
    path: "seed/lectura-la-celula.pdf",
    titulo: "Lectura: partes de la celula",
    texto: "Membrana, citoplasma y nucleo. Compara la celula animal con la vegetal.",
  },
];

cargarEnv(".env.local");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

// Crea el bucket privado si todavia no existe (la migracion tambien lo crea).
const { data: bucket } = await supabase.storage.getBucket("materiales");
if (!bucket) {
  const { error } = await supabase.storage.createBucket("materiales", {
    public: false,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/png",
      "image/jpeg",
      "image/gif",
      "image/webp",
    ],
  });
  if (error) {
    console.error(`Error creando el bucket: ${error.message}`);
    process.exit(1);
  }
  console.log("Bucket privado 'materiales' creado");
}

for (const a of ARCHIVOS) {
  const { error } = await supabase.storage
    .from("materiales")
    .upload(a.path, crearPdf(a.titulo, a.texto), { contentType: "application/pdf", upsert: true });
  if (error) {
    console.error(`Error subiendo ${a.path}: ${error.message}`);
    process.exitCode = 1;
  } else {
    console.log(`Subido: ${a.path}`);
  }
}
