import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isRender = process.env.RENDER === "true";

const localDbPath = path.join(__dirname, "../../database/sqLite.db");
const renderDbPath = "/data/sqLite.db";
const dbPath = isRender ? renderDbPath : localDbPath;
console.log(`Base de datos cargada desde: ${dbPath}`);


export const db = new Database(dbPath, { verbose: console.log });
