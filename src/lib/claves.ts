import "server-only";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

// Hash de claves con scrypt. Formato guardado: scrypt$<salt hex>$<hash hex>

const scryptAsync = promisify(scrypt) as (clave: string, salt: string, largo: number) => Promise<Buffer>;

export async function hashClave(clave: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = await scryptAsync(clave, salt, 64);
  return `scrypt$${salt}$${hash.toString("hex")}`;
}

export async function verificarClave(clave: string, guardado: string): Promise<boolean> {
  const [algoritmo, salt, hashHex] = guardado.split("$");
  if (algoritmo !== "scrypt" || !salt || !hashHex) return false;
  const esperado = Buffer.from(hashHex, "hex");
  const calculado = await scryptAsync(clave, salt, esperado.length);
  return timingSafeEqual(calculado, esperado);
}
