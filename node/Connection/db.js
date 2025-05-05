import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localDbPath = path.join(__dirname, "../../database/sqLite.db");
const renderDbPath = "/data/sqLite.db";

// Detectar entorno: si DATABASE_PATH_SAUL está definida, úsala
const dbPath = process.env.DATABASE_PATH_SAUL || localDbPath;

console.log(`Base de datos cargada desde: ${dbPath}`);

// Si estamos en Render (detectando por si la ruta es /data/) y no existe el archivo, lo copiamos
if (dbPath === renderDbPath) {
    // Verificar si existe la carpeta /data, si no la crea
    if (!fs.existsSync("/data")) {
        fs.mkdirSync("/data");
        console.log("Carpeta /data creada.");
    }

    // Si no existe la base en /data, la copia desde local
    if (!fs.existsSync(renderDbPath)) {
        fs.copyFileSync(localDbPath, renderDbPath);
        console.log("Base de datos copiada a /data/sqLite.db");
    }
}

// Conectar a la base
export const db = new Database(dbPath, { verbose: console.log });
