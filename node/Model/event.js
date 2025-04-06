import { db } from "../Connection/db.js";
import crypto from 'crypto';
import {BET_STATUS, EVENT_RESULTS, EVENT_STATUS} from "../utils/consts.js";

export class EventModel{
    //✅
    static async getEventById(id_event){
        try {
            const event = db.prepare(`
            SELECT * FROM events WHERE id_event = ?
            `);
            return event.get(id_event);
        }catch (error){
            console.log("Error al encontrar el evento", error)
            throw error;
        }
    }
    //✅
    static async search(params){
        const conditions = [];
        const queryParams = [];

        for(const [key, value] of Object.entries(params)){
            conditions.push(`${key} = ?`);
            queryParams.push(value);
        }
        if (conditions.length === 0){
            throw new Error("No hay filtros de busqueda")
        }
        const query = `SELECT * FROM events WHERE ${conditions.join(' AND ')}`;

        return db.prepare(query).all(...queryParams);

    }
    //✅
    static async createEvent({ data }){
        try {
            const id_event = crypto.randomUUID();
            const now = new Date();
            const status = EVENT_STATUS.EN_PROCESO;
            const begin_date = now.toISOString();
            const end_date = null;
            const result = EVENT_RESULTS.PENDIENTE;
            const eventData = {
                id_event,
                status,
                ...data,
                result,
                begin_date,
                end_date
            }

            const fields = Object.keys(eventData).join(', ');
            const places = Object.keys(eventData).map(() => '?').join(', ');
            const values = Object.values(eventData);

            db.prepare(`
                INSERT INTO events(${fields}) VALUES(${places})
            `).run(...values);

            return db.prepare(`SELECT * FROM events WHERE id_event = ?`).get(id_event);
        }catch (error){
            console.log("Error al crear la apuesta", error)
            throw error;
        }
    }
    //✅
    static async closeEvent(id_event, result){
        try {
            const now = new Date().toISOString();
            db.prepare(`UPDATE events
                            SET status = ?, result = ?, end_date = ? 
                            WHERE id_event = ?`).
            run(EVENT_STATUS.FINALIZADO, result, now,id_event);

            return db.prepare(`SELECT * FROM events WHERE id_event = ?`).get(id_event);
        }catch (error){
            console.log("Error al cerrar el evento");
            throw error;
        }
    }
}