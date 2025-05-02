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

            if (eventCreated.sport.includes("1 vs 1")) {
                console.log("Outcomes para 1 vs 1");
                for (const outcome of outcomes) {
                    if (!outcome.outcome_name || isNaN(outcome.official_odds)) {
                        throw new Error("Datos incompletos en uno de los outcomes");
                    }
                    db.prepare(`
                    INSERT INTO event_outcomes (id_outcome, id_event, outcome_name, official_odds)
                    VALUES (?, ?, ?, ?)
                `).run(crypto.randomUUID(), id_event, outcome.outcome_name, outcome.official_odds);
                }
            } else {
                console.log("Outcomes de evento normal");
                for (const outcome of outcomes) {
                    if (!outcome.outcome_name || isNaN(outcome.official_odds)) {
                        throw new Error("Datos incompletos en uno de los outcomes");
                    }
                    db.prepare(`
                    INSERT INTO event_outcomes (id_outcome, id_event, outcome_name, official_odds)
                    VALUES (?, ?, ?, ?)
                `).run(crypto.randomUUID(), id_event, outcome.outcome_name, outcome.official_odds);
                }
            }

            return eventCreated;
        }catch (error){
            console.log("Error al crear la apuesta", error)
            throw error;
        }
    }
    // PATCH
    static async closeEvent(id_event, result) {
        try {
            const now = new Date();
            const end_date = now.toLocaleDateString() + " " + now.toLocaleTimeString();

            db.prepare(`
            UPDATE events
            SET status = ?, result = ?, end_date = ?
            WHERE id_event = ?
        `).run(EVENT_STATUS.FINALIZADO, result, end_date, id_event);

            const event = db.prepare(`SELECT name FROM events WHERE id_event = ?`).get(id_event);
            const eventName = event?.name;
            if (!eventName) return;

            // Se cierran todos los eventos derivados que salen de este mismo
            const derivedEvents = db.prepare(`
            SELECT * FROM events
            WHERE name = ? AND sport LIKE '%1 vs 1%' AND id_event != ?
            `).all(eventName, id_event);

            for (const ev of derivedEvents) {
                db.prepare(`
                    UPDATE events
                    SET status = ?, result = ?, end_date = ?
                    WHERE id_event = ?
                `).run(EVENT_STATUS.FINALIZADO, result, end_date, ev.id_event);
            }

            return db.prepare(`SELECT * FROM events WHERE id_event = ?`).get(id_event);
        } catch (error) {
            console.log("Error al cerrar el evento", error);
            throw error;
        }
    }


    //PATCH
    static async updateEvent({ id_event, name, sport, status }) {
        try {
            const eventBefore = db.prepare(`SELECT * FROM events WHERE id_event = ?`).get(id_event);
            if (!eventBefore) throw new Error("Evento no encontrado");

            const updates = [];
            const values = [];

            if (name) {
                updates.push("name = ?");
                values.push(name);
            }
            if (sport) {
                updates.push("sport = ?");
                values.push(sport);
            }
            if (status) {
                updates.push("status = ?");
                values.push(status);
            }

            if (updates.length === 0) throw new Error("Nada para actualizar");

            const query = `UPDATE events SET ${updates.join(", ")} WHERE id_event = ?`;
            values.push(id_event);
            db.prepare(query).run(...values);

            if (sport && sport !== eventBefore.sport) {
                const removeStatsFrom = (table) => {
                    db.prepare(`DELETE FROM ${table} WHERE id_event = ?`).run(id_event);
                };

                switch (eventBefore.sport.toLowerCase()) {
                    case CATEGORY.SOCCER:
                    case CATEGORY.UNO_A_UNO_SOCCER:
                        removeStatsFrom("soccer_stats");
                        break;
                    case CATEGORY.BASKETBALL:
                    case CATEGORY.UNO_A_UNO_BASKETBALL:
                        removeStatsFrom("basketball_stats");
                        break;
                    case CATEGORY.FOOTBALL:
                    case CATEGORY.UNO_A_UNO_FOOTBALL:
                        removeStatsFrom("football_stats");
                        break;
                }

                const [home_team, away_team] = (name || eventBefore.name).split(" vs ");
                switch (sport.toLowerCase()) {
                    case CATEGORY.SOCCER:
                    case CATEGORY.UNO_A_UNO_SOCCER:
                        db.prepare(`INSERT INTO soccer_stats(id_event, home_team, away_team) VALUES(?,?,?)`).run(id_event, home_team, away_team);
                        break;
                    case CATEGORY.BASKETBALL:
                    case CATEGORY.UNO_A_UNO_BASKETBALL:
                        db.prepare(`INSERT INTO basketball_stats(id_event, home_team, away_team) VALUES(?,?,?)`).run(id_event, home_team, away_team);
                        break;
                    case CATEGORY.FOOTBALL:
                    case CATEGORY.UNO_A_UNO_FOOTBALL:
                        db.prepare(`INSERT INTO football_stats(id_event, home_team, away_team) VALUES(?,?,?)`).run(id_event, home_team, away_team);
                        break;
                }
            }

            return db.prepare(`SELECT * FROM events WHERE id_event = ?`).get(id_event);
        } catch (error) {
            console.log("Error al actualizar el evento", error);
            throw error;
        }
    }

    static async updateOutcomeOdds({ id_outcome, official_odds }) {
        db.prepare(`
            UPDATE event_outcomes
            SET official_odds = ?
            WHERE id_outcome = ?
        `).run(official_odds,id_outcome);
        return db.prepare(`SELECT * FROM event_outcomes 
            WHERE id_outcome = ?`).get(id_outcome);
    }
    static async updateOutcomesByIdEvent(id_event, outcomes) {
        const updateStmt = db.prepare(`
            UPDATE event_outcomes
            SET official_odds = ?
            WHERE id_event = ? AND outcome_name = ?
        `);
    
        const selectStmt = db.prepare(`
            SELECT * FROM event_outcomes
            WHERE id_event = ? AND outcome_name = ?
        `);
    
        const updated = [];
    
        for (const { outcome_name, official_odds } of outcomes) {
            if (typeof outcome_name !== 'string' || typeof official_odds !== 'number') continue;
    
            updateStmt.run(official_odds, id_event, outcome_name);
            const row = selectStmt.get(id_event, outcome_name);
            if (row) updated.push(row);
        }
    
        return updated;
    }
    //DELETE
    static async deleteEvent( id ) {
        try {
            const id_event = id;
            const {sport} = db.prepare(`SELECT sport FROM  events 
                WHERE id_event = ?`)
                .get(id_event);
            let deleteStats;
            switch (sport) {
                case "futbol":
                case "1 vs 1 futbol":
                   db.prepare(`DELETE FROM soccer_stats WHERE id_event = ?`).run(id_event);
                    break;
                case "basquetbol":
                case "1 vs 1 basquetbol":
                    db.prepare(`DELETE FROM basketball_stats WHERE id_event = ?`).run(id_event);
                    break;
                case "futbol americano":
                case "1 vs 1 futbol americano":
                    db.prepare(`DELETE FROM football_stats WHERE id_event = ?`).run(id_event);
                    break;
                default:
                    throw new Error("Deporte no soportado");
            }
            db.prepare(`DELETE FROM event_outcomes
                WHERE id_event=?`).run(id_event);
            const eventDelete = db.prepare(`DELETE FROM events WHERE id_event = ?`);
            const result= eventDelete.run(id_event);
            return result.changes;
        } catch (error) {
            console.error("No se encontro la apuesta", error);
            throw error;
        }
    }
}