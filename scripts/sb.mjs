// Ejecuta el CLI de Supabase confiando en el certificado de Zscaler (red corporativa).
// Uso: npm run sb -- <comando>   por ejemplo: npm run sb -- db push

import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const cert = join(homedir(), ".zscaler-root.pem");
const env = { ...process.env };
if (existsSync(cert)) {
  env.SSL_CERT_FILE ??= cert;
  env.NODE_EXTRA_CA_CERTS ??= cert;
}

// Toma el token personal de .env.local para que el CLI no pida login interactivo.
if (!env.SUPABASE_ACCESS_TOKEN && existsSync(".env.local")) {
  const m = readFileSync(".env.local", "utf8").match(/^SUPABASE_ACCESS_TOKEN=(.+)$/m);
  if (m) env.SUPABASE_ACCESS_TOKEN = m[1].trim();
}

const r = spawnSync("npx", ["supabase", ...process.argv.slice(2)], { stdio: "inherit", env, shell: true });
process.exit(r.status ?? 1);
