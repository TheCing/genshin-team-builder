import { dirname } from "path";
import { fileURLToPath } from "url";
import { join } from "path";
import * as dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

export function getEnvVar(key) {
  const value = process.env[key];
  return value || null;
}
