import { db } from "../Connection/db.js";
import {BET_STATUS, EVENT_TYPES} from "../utils/consts.js";

export class BetModel {
    // GET
    static async getAllBets() {
        try {
            const bets = db.prepare(`SELECT * FROM bets`);
            return bets.all();
        } catch (error) {
            console.log("Error al obtener las apuestas: ", error);
            throw error;
        }
    }

    // GET ✅
    static async getBetById(id_bet) {
        try {
            const bet = db.prepare(`SELECT * FROM bets WHERE id_bet = ?`);
            return bet.get(id_bet);
        } catch (error) {
            console.log("Error al obtener la apuesta", error);
            throw error;
        }
    }

    // PATCH ✅
    static async acceptBet(id_bet, id_user) {
        try {
            const bet = db.prepare(`SELECT * FROM bets WHERE id_bet = ?`).get(id_bet);
            if(!bet){
                return console.error("Error al buscar la apuesta");
            }
            if(bet.id_user === id_user){
                console.log("No puede aceptar la apuesta enviada")
                return;
            }
            if(bet.status !== BET_STATUS.ENVIADA){
                return console.error("La apuesta ya esta en proceso");
            }

            const betData = {
                id_user,
                id_event: bet.id_event,
                category: bet.category,
                type: bet.type,
                amount:bet.amount,
                extra: bet.extra
            }

            await this.createBet({data:betData});
            db.prepare(`UPDATE bets
                            SET status = ?
                            WHERE id_event = ?`).run(BET_STATUS.EN_PROCESO, bet.id_event);

            const now = new Date().toISOString();

            db.prepare(`UPDATE bets
                            SET status = ?, begin_date = ?
                            WHERE id_bet = ?`
            ).run(BET_STATUS.EN_PROCESO, now, id_bet);

            return db.prepare(`SELECT * FROM bets WHERE id_bet = ?`).get(id_bet);

        } catch (error) {
            console.error("Error al aceptar apuesta:", error);
            throw error;
        }
    }
    //GET
    static async search(params){
        try {
            const conditions = [];
            const queryParams = [];
            for (const [key, value] of Object.entries(params)) {
                conditions.push(`${key} = ?`);
                queryParams.push(value);
            }
            if (conditions.length === 0) {
                throw new Error("No hay filtros de busqueda ")
            }

            const query = `SELECT * FROM bets WHERE ${conditions.join(' AND ')}`;
            return db.prepare(query).all(...queryParams);
        } catch(error){
            console.log("Error al buscar por filtros");
        }

    }
    // POST ✅
    static async createBet({ data }) {
        try {
            const id_bet = crypto.randomUUID();
            const now = new Date();
            let begin_date = now.toISOString();
            let status =  BET_STATUS.EN_PROCESO;
            if(data.category === EVENT_TYPES.UNO_A_UNO){
                begin_date = null;
                status = BET_STATUS.ENVIADA;
            }
            const end_date = null;
            const result = null;

            const betData = {
              id_bet,
              ...data,
              result,
              status,
              begin_date,
              end_date
            };

            const fields = Object.keys(betData).join(", ");
            const places =  Object.keys(betData).map(()=> "?" ).join(", ")
            const values = Object.values(betData);

            db.prepare(`INSERT INTO bets (${fields}) VALUES(${places})`).run(...values);
            return db.prepare(`SELECT * FROM bets WHERE id_bet = ?`).get(id_bet);

        } catch (error) {
            console.error("Error al crear la apuesta", error);
            throw error;
        }
    }

    // DELETE
    static async deleteBet(id_bet) {
        try {
            const result = db.prepare(`DELETE FROM bets WHERE id_bet = ?`).run(id_bet);
            return result.changes;
        } catch (error) {
            console.error("Error al eliminar la apuesta", error);
            throw error;
        }
    }
}
