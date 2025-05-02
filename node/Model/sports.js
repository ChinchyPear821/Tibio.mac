import { db } from "../Connection/db.js";

const tableMap ={
    "futbol": "soccer_stats",
    "basquetbol": "basketball_stats",
    "futbol americano":"football_stats",
    "1 vs 1 futbol": "soccer_stats",
    "1 vs 1 basquetbol": "basketball_stats",
    "1 vs 1 futbol americano": "football_stats"
};

export class SportStatsModel{
    static validateSportType(type){
        const table = tableMap[type];
        if(!table){
            throw new Error("El deporte no esta disponible")
        }
        return table
    }
    static async createStats(type, {data}) {
        try {
            const statsData={...data}
            const table = this.validateSportType(type);
            const keys = Object.keys(data).join(', ');
            const places = Object.keys(data).map(() => '?').join(', ');
            const values = Object.values(statsData);

            db.prepare(`INSERT INTO ${table} (${keys}) VALUES (${places})`).run(...values);
            return db.prepare(`SELECT * FROM ${table} WHERE id_event = ?`).get(data.id_event);

        }catch (error){
            console.log("Error al crear las estadisticas", error)
        }
    }
    //Aqui se actualizan tanto el evento principal que no es 1 vs 1 como las apuestas que si son 1 vs 1 y se aplican
    // los mismos stats para ese evento
    static async updateStats({type, id_event, data}) {
        try {   
            const table = this.validateSportType(type);
            const sets = Object.keys(data).map(key => `${key} = ?`).join(', ');
            const values = [...Object.values(data), id_event];

            db.prepare(`UPDATE ${table} SET ${sets} WHERE id_event = ?`).run(...values);

            const updatedEvent = db.prepare(`SELECT * FROM ${table} WHERE id_event = ?`).get(id_event);
            if (!updatedEvent) return;

            const event = db.prepare(`SELECT name FROM events WHERE id_event = ?`).get(id_event);
            const eventName = event?.name;
            if (!eventName) return updatedEvent;

            const oneVsOneEvents = db.prepare(`
            SELECT * FROM events
            WHERE name = ? AND sport LIKE '%1 vs 1%' AND id_event != ?
        `).all(eventName, id_event);

            for (const ev of oneVsOneEvents) {
                const oneVsOneTable = this.validateSportType(ev.sport);
                if (!oneVsOneTable) continue;

                const sets1vs1 = Object.keys(data).map(key => `${key} = ?`).join(', ');
                const values1vs1 = [...Object.values(data), ev.id_event];

                db.prepare(`UPDATE ${oneVsOneTable} SET ${sets1vs1} WHERE id_event = ?`).run(...values1vs1);
            }

            return updatedEvent;
        } catch (error){
            console.log("Error al actualizar las estadísticas", error);
        }
    }


    static async getStats({type, id_event}) {
        try {
            const table = this.validateSportType(type);
            return db.prepare(`SELECT * FROM ${table} WHERE id_event = ?`).get(id_event);

        }catch (error){
            console.log(`Error al obtener las estadisticas de ${table}`, error);
        }
    }
}
