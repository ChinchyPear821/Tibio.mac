import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localDbPath = path.join(__dirname, "../../database/sqLite.db");
const renderDbPath = "/data/sqLite.db";

const dbPath = process.env.DATABASE_PATH_SAUL || localDbPath;

console.log(`Base de datos cargada desde: ${dbPath}`);

// Si estamos en Render (usando /data/sqLite.db) y no existe la base, la copia desde local
if (dbPath === renderDbPath) {
    if (!fs.existsSync(renderDbPath)) {
        fs.copyFileSync(localDbPath, renderDbPath);
        console.log("Base de datos copiada a /data/sqLite.db");
    }
}

// Conectar a la base
export const db = new Database(dbPath, { verbose: console.log });
