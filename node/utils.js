import { db } from "./Connection/db.js"

export function getRowById (table, id_table, id) {
    return db.prepare(`
        SELECT * FROM ${table} WHERE ${id_table} = ?
    `).all(id)
}