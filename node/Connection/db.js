/*Gilberto */

import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const db = new Database(path.join(__dirname, "../../database/sqLite.db"), {
    verbose: console.log
});
/*
Saul
import Database from "better-sqlite3";

export const db = new Database("./database/sqLite.db", { verbose: console.log });
*/