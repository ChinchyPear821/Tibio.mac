import {db} from "../Connection/db.js";
import crypto from 'crypto';
import {CATEGORY, EVENT_RESULTS, EVENT_STATUS} from "../utils/consts.js";

export class EventModel{
    static async getAllEvents(){
        try{
            return db.prepare(`SELECT * FROM events`).all();
        }catch(error){
            console.log("Error al buscar los eventos")
        }
    }
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
    //GET
    static async getAllCurrentEvents(){
        try{

            const events = db.prepare(`
                SELECT * FROM events 
                WHERE status = 'EN PROCESO'`
            );
            return events.all();
        }catch(error){
            console.log("Error al obtener los eventos: ", error);
            throw error
        }
    }

    // GET
    static async getOutcomesByEventId(id_event) {
        try {
            // Aquí se consulta la base de datos para obtener los outcomes
            return db.prepare(`
                SELECT * FROM event_outcomes WHERE id_event = ?
            `).all(id_event);  // Devuelve los outcomes obtenidos
        } catch (error) {
            console.error("Error al obtener outcomes por id_event:", error);
            throw error;
        }
    }
    // GET ( lo hizo GPT )
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
    // GET
    static async createEvent({ data }){
        try {
            const {outcomes, ...dataEvent} = data;
            const id_event = crypto.randomUUID();
            const now = new Date();
            const status = EVENT_STATUS.EN_PROCESO;
            const begin_date = now.toLocaleDateString() + " " + now.toLocaleTimeString() ;
            const end_date = null;
            const result = EVENT_RESULTS.PENDIENTE;
            const eventData = {
                id_event,
                status,
                ...dataEvent,
                result,
                begin_date,
                end_date
            }
            // Hace lo mismo que en las apuestas para que sea dinamico cuando creas en una consulta SQL y usa la misma logica del "search"
            const fields = Object.keys(eventData).join(', ');
            const places = Object.keys(eventData).map(() => '?').join(', ');
            const values = Object.values(eventData);


            db.prepare(`
                INSERT INTO events(${fields}) VALUES(${places})
            `).run(...values);
            const eventCreated = db.prepare(`SELECT * FROM events WHERE id_event = ?`).get(id_event);
            //Aqui asignamos a el evento un partido insertando en el solo los equipos y el id evento, para actualizarlo hay otro endpoint
            const [home_team, away_team] = eventCreated.name.split(" vs ");
            switch (eventCreated.sport.toLowerCase()){
                case CATEGORY.SOCCER:
                case CATEGORY.UNO_A_UNO_SOCCER:
                    db.prepare(`INSERT INTO soccer_stats(id_event, home_team, away_team) VALUES(?,?,?)`).run(
                        id_event, home_team, away_team);
                    break;
                case CATEGORY.BASKETBALL:
                case CATEGORY.UNO_A_UNO_BASKETBALL:
                    db.prepare(`INSERT INTO basketball_stats(id_event, home_team, away_team) VALUES(?,?,?)`).run(
                        id_event, home_team, away_team);
                    break;
                case CATEGORY.FOOTBALL:
                case CATEGORY.UNO_A_UNO_FOOTBALL:
                    db.prepare(`INSERT INTO football_stats(id_event, home_team, away_team) VALUES(?,?,?)`).run(
                        id_event, home_team, away_team);
                    break;
            }


            // Codigo para guardar los outcomes en la tabla
            const insertOutcome = db.prepare(`
                INSERT INTO event_outcomes (id_outcome, id_event, outcome_name, official_odds)
                VALUES (?, ?, ?, ?)
            `);
            console.log("outcomes", outcomes);
            for (const outcome of outcomes) {
                if (!outcome.outcome_name || isNaN(outcome.official_odds)) {
                    throw new Error("Datos incompletos en uno de los outcomes");
                }
                insertOutcome.run(
                    crypto.randomUUID(),
                    id_event,
                    outcome.outcome_name,
                    outcome.official_odds
                );
            }
            return eventCreated;
        }catch (error){
            console.log("Error al crear la apuesta", error)
            throw error;
        }
    }
    // PATCH
    static async closeEvent(id_event, result){
        try {
            const now = new Date();
            const end_date = now.toLocaleDateString() + " " + now.toLocaleTimeString();
            db.prepare(`UPDATE events
                            SET status = ?, result = ?, end_date = ? 
                            WHERE id_event = ?`).
            run(EVENT_STATUS.FINALIZADO, result, end_date,id_event);

            return db.prepare(`SELECT * FROM events WHERE id_event = ?`).get(id_event);
        }catch (error){
            console.log("Error al cerrar el evento");
            throw error;
        }
    }

    //DELETE
    static async deleteEvent({ data }) {
        try {
            const {id_event} = data
            const eventDelete = db.prepare(`DELETE FROM events WHERE id_event = ?`);
            const result= eventDelete.run(id_event);
            return result.changes;
        } catch (error) {
            console.error("No se encontro la apuesta", error);
            throw error;
        }
    }
}