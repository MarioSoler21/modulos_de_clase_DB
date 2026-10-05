// Aplica las migraciones pendientes de supabase/migrations usando la Management API
// de Supabase (HTTPS). Sirve en redes que bloquean los puertos de Postgres (5432/6543),
// donde "supabase db push" no puede conectar.
//
// Registra cada migracion en supabase_migrations.schema_migrations, la misma tabla que
// usa el CLI, asi que "npm run sb -- migration list" sigue mostrando el historial.
//
// Uso:
//   npm run db:push            aplica migraciones pendientes
//   npm run db:push -- --seed  ademas corre supabase/seed.sql
//   npm run db:sql -- "select ..."   ejecuta una consulta suelta

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

function leerEnv() {
  const env = {};
  try {
    for (const linea of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
      const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2];
    }
  } catch {
    // Sin .env.local se usan solo las variables del entorno.
  }
  return { ...env, ...process.env };
}

const env = leerEnv();
const token = env.SUPABASE_ACCESS_TOKEN;
const ref = (env.NEXT_PUBLIC_SUPABASE_URL ?? "").match(/https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1];
if (!token || !ref) {
  console.error("Faltan SUPABASE_ACCESS_TOKEN o NEXT_PUBLIC_SUPABASE_URL en .env.local");
  process.exit(1);
}

async function sql(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const texto = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${texto}`);
  return texto ? JSON.parse(texto) : [];
}

const literal = (s) => `'${s.replace(/'/g, "''")}'`;

const args = process.argv.slice(2);

if (args[0] === "--sql") {
  console.log(JSON.stringify(await sql(args.slice(1).join(" ")), null, 2));
} else {
  await migrar();
}

async function migrar() {
await sql(`
  create schema if not exists supabase_migrations;
  create table if not exists supabase_migrations.schema_migrations (
    version text primary key,
    statements text[],
    name text
  );
`);

const aplicadas = new Set(
  (await sql("select version from supabase_migrations.schema_migrations")).map((r) => r.version),
);

const dir = join("supabase", "migrations");
const archivos = readdirSync(dir).filter((f) => /^\d+_.+\.sql$/.test(f)).sort();
let pendientes = 0;

for (const archivo of archivos) {
  const [, version, nombre] = archivo.match(/^(\d+)_(.+)\.sql$/);
  if (aplicadas.has(version)) continue;
  pendientes++;
  const contenido = readFileSync(join(dir, archivo), "utf8");
  // Migracion y registro en una sola transaccion: si algo falla no queda a medias.
  await sql(
    `begin;\n${contenido}\n;insert into supabase_migrations.schema_migrations (version, name, statements) ` +
      `values (${literal(version)}, ${literal(nombre)}, array[${literal(contenido)}]);\ncommit;`,
  );
  console.log(`Aplicada: ${archivo}`);
}

if (pendientes === 0) console.log("No hay migraciones pendientes.");

if (args.includes("--seed")) {
  await sql(readFileSync(join("supabase", "seed.sql"), "utf8"));
  console.log("Seed aplicado: supabase/seed.sql");
}
}
