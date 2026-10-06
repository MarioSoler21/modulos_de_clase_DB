// Ejecuta Next.js confiando en el certificado de la red corporativa (Zscaler) si existe.
// Uso: node scripts/next.mjs <dev|build|start> [...]
// NODE_EXTRA_CA_CERTS se hereda a los procesos internos de Next (a diferencia de
// --use-system-ca, que Next no permite en sus workers).

import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const cert = join(homedir(), ".zscaler-root.pem");
const env = { ...process.env };
if (existsSync(cert) && !env.NODE_EXTRA_CA_CERTS) env.NODE_EXTRA_CA_CERTS = cert;

const next = join("node_modules", "next", "dist", "bin", "next");
const r = spawnSync(process.execPath, [next, ...process.argv.slice(2)], { stdio: "inherit", env });
process.exit(r.status ?? 1);
