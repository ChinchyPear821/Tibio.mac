import Database from "better-sqlite3";

export const db = new Database("./database/sqLite.db", { verbose: console.log });