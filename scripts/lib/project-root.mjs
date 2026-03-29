import path from "node:path";
import { fileURLToPath } from "node:url";

const libDir = path.dirname(fileURLToPath(import.meta.url));

/** Repository root (parent of `scripts/`). */
export const projectRoot = path.resolve(libDir, "..", "..");

/** `scripts/` directory. */
export const scriptsDir = path.resolve(libDir, "..");
