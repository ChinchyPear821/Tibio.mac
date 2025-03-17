import { db } from "../Connection/db.js"

export class BetModel{
    //GET
    static async getAllBets(){
        try {
            const bets = db.prepare(`SELECT * FROM bets`);
            return bets.all();
        } catch (error) {
            console.log("Error al obtener las apuestas: ", error);
            throw error;
        }
    }
    static async getAllEvents(){
        try{

            const events = db.prepare(`
                SELECT * FROM events`
            );
            return events.all();
        }catch(error){
            console.log("Error al obtener los eventos: ", error);
            throw error
        }
    }
    static async getAllBetsByUserId({ data }){
        try{
            const { id_user } = data;
            const bets = db.prepare(`
                SELECT * FROM bets WHERE id_user = ?`
            );
            return bets.all(id_user);
        }catch(error){
            console.log("Error al obtener las apuestas del usuario:", error);
            throw error
        }
    }
    //GET
    static async getBetById({ data }){
        try{
            const { id_bet } = data;
            const bet = db.prepare(`
                SELECT * FROM bets WHERE id_bet = ?`
            );
            return bet.get(id_bet);
        }catch(error){
            console.log("Error al obtener la apuesta", error);
            throw error
        }
    }
    static async getEventById({ data }){
        try{
            const { id_event } = data;
            const event = db.prepare(`
                SELECT * FROM events WHERE id_event = ?`
            );
            return event.get(id_event);
        }catch(error){
            console.log("Error al obtener el evento", error);
            throw error
        }
    }



    //POST

    static async acceptBet({ data }){
        try {
            const { id_bet, id_user } = data;

            if (!id_bet || !id_user) {
                throw new Error("Datos incompletos para aceptar la apuesta");
            }

            const bet = db.prepare(`SELECT * FROM bet WHERE id_bet = ?`).get(id_bet);

            if (!bet) {
                throw new Error("La apuesta no existe");
            }

            if (bet.status !== "EN PROCESO") {
                throw new Error("La apuesta ya ha sido aceptada");
            }
            const updateBet = db.prepare(`
                UPDATE bet
                SET status = 'ACEPTADO'
                WHERE id_bet = ?
            `);

            updateBet.run(id_bet);

            return { id_bet, id_user, status: "ACEPTADO" };

        } catch (error) {
            console.error("Error al aceptar apuesta:", error);
            throw error;
        }
    }
    //POST
    static async createEvent({ data }){
        try {
            const { name, status, sport } = data;

            if (!name || !status || !sport) {
                throw new Error("Datos incompletos");
            }

            const id_event = crypto.randomUUID();
            const date = new Date().toISOString().split("T")[0];
            const hour = new Date().toISOString().split("T")[1].split(".")[0];

            const insertEvent = db.prepare(`
            INSERT INTO events (id_event, name, status, sport, date, hour)
            VALUES (?, ?, ?, ?, ?, ?)
            `);

            insertEvent.run(id_event, name, status, sport, date, hour);

            const event = db.prepare(`SELECT * FROM events WHERE id_event = ?`).get(id_event);

            return event;
        } catch (error) {
            console.error("Error al crear evento:", error);
            throw error;
        }
    }
    static async createBet({ data }) {
        try {
            const { id_user, id_event, type, amount, extra } = data;
            const id_bet = crypto.randomUUID();
            const status = "EN PROCESO";
            const result = null;
            const date = new Date().toISOString().split("T")[0];
            const hour = new Date().toISOString().split("T")[1].split(".")[0];

            console.log("Datos que se van a insertar:", {
                id_bet, id_user, id_event, type, amount, extra, status, result, date, hour
            });

            const createBet = db.prepare(`
            INSERT INTO bets (
                id_bet, id_user, id_event, type, amount, extra, status, result, date, hour
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

            createBet.run(id_bet, id_user, id_event, type, amount, extra, status, result, date, hour);

            console.log("Apuesta creada correctamente");

            return { id_bet, id_user, id_event, type, amount, extra, status, date, hour };
        } catch (error) {
            console.error("Error al crear la apuesta", error);
            throw error;
        }
    }

    //DELETE
    static async deleteBet(id_bet) {
        try {
            const betDelete = db.prepare(`DELETE FROM bets WHERE id_bet = ?`);
            const result=betDelete.run(id_bet);
            return result.changes;
        } catch (error) {
            console.error("No se encontro la apuesta", error);
            throw error;
        }
    }

    static async deleteEvent({ data }) {
        try {
            const {id_event} = data
            const eventDelete = db.prepare(`DELETE FROM events WHERE id_event = ?`);
            return eventDelete.run(id_event)
        } catch (error) {
            console.error("No se encontro la apuesta", error);
            throw error;
        }
    }

}