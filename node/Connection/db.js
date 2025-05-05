import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta de base local (porque Render también monta tu proyecto completo en /opt/render/project/src/)
const dbPath = path.join(__dirname, "../../database/sqLite.db");

console.log(`Base de datos cargada desde: ${dbPath}`);

export const db = new Database(dbPath, { verbose: console.log });
