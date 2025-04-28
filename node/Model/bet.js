import { db } from "../Connection/db.js";
import {BET_STATUS, CATEGORY, EVENT_STATUS} from "../utils/consts.js";
import {calculateTarget} from "../utils/functions.js";

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

    // GET
    static async getBetById(id_bet) {
        try {
            const bet = db.prepare(`SELECT * FROM bets WHERE id_bet = ?`);
            return bet.get(id_bet);
        } catch (error) {
            console.log("Error al obtener la apuesta", error);
            throw error;
        }
    }

    // PATCH *****
    static async acceptBet(id_bet, id_user) {
        try {
            const bet = db.prepare(`SELECT * FROM bets WHERE id_bet = ?`).get(id_bet);
            const event = db.prepare(`SELECT * FROM events WHERE id_event = ?`).get(bet.id_event);
            //Para diferenciar los sport o tipos de evento que son del tipo 1 vs 1 con los normales
            const isOneVsOne = event.sport.startsWith("1 vs 1");

            if (!isOneVsOne) {
                return console.log("Error al aceptar la apuesta, no es 1 vs 1");
            }

            if (bet.id_user === id_user) {
                return console.log("Error no puedes aceptar la apuesta que enviaste");
            }

            if (bet.status !== BET_STATUS.ENVIADA) {
                return console.log("La apuesta ya esta en proceso");
            }
            //Obtiene el balance del usuario
            const userBalance = db.prepare(`SELECT balance FROM users WHERE id_user = ?`).get(id_user)?.balance;
            //Verifica que tenga el balance para poder apostar el otro usuario
            if (userBalance === undefined || userBalance < bet.amount) {
                return console.error("Saldo insuficiente para aceptar la apuesta");
            }

            db.prepare(`UPDATE users SET balance = balance - ? WHERE id_user = ?`).run(bet.amount, id_user);
            //Aqui se usa esa funcion para elegir el otro target distinto al que se envia para que tenga sentido la apuesta 1vs1
            const opossiteTarget = calculateTarget({bet})
            const betData = {
                id_user,
                id_event: bet.id_event,
                category: bet.category,
                type: bet.type,
                target:opossiteTarget,
                amount: bet.amount,
                extra: bet.extra
            };
            const now = new Date();
            const begin_date = now.toLocaleDateString() + " " + now.toLocaleTimeString();
            //Usoo la misma funcion para crear apuestas pero mandamos el status y la fecha para que no se cambien de nuevo a pendiente

            await this.createBet({
                data: {
                    ...betData,
                    status: BET_STATUS.EN_PROCESO,
                    begin_date: begin_date
                }, id_user_token: id_user
            });

            db.prepare(`UPDATE bets SET status = ?, begin_date = ? WHERE id_bet = ?`)
                .run(BET_STATUS.EN_PROCESO, begin_date, id_bet);
            db.prepare(`UPDATE bets SET status = ?, begin_date = ? WHERE id_user=?`).run(BET_STATUS.EN_PROCESO,begin_date, bet.id_event);
            return db.prepare(`SELECT * FROM bets WHERE id_event = ?`).get(bet.id_event);

        } catch (error) {
            console.error("Error al aceptar apuesta:", error);
            throw error;
        }
    }


    static async rejectBet(id_bet, id_user) {
        try {
            // Buscar la apuesta por ID
            const bet = await db.prepare('SELECT * FROM bets WHERE id_bet = ?').get(id_bet);

            if (bet.length === 0) {
                throw new Error('Apuesta no encontrada');
            }

            // Validar que el usuario que rechaza sea el emisor
            if (bet.id_user !== id_user) {
                throw new Error('Solo el emisor puede cancelar esta apuesta');
            }

            // Regresar el dinero al emisor
            await db.prepare('UPDATE users SET balance = balance + ? WHERE id_user = ?').run(bet.amount, id_user);

            // Eliminar la apuesta
            await db.prepare('DELETE FROM bets WHERE id_bet = ?').get(id_bet);

            return { message: 'Apuesta rechazada y dinero devuelto al emisor' };
        } catch (error) {
            throw new Error(error.message);
        }
    }

    //GET ( lo hizo GPT )
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
            throw error;
        }

    }

    static async create1v1Bet({ data, id_user_token }) {
        try {
            const event = db.prepare(`SELECT * FROM events WHERE id_event = ?`).get(data.id_event);
            if (event.status === EVENT_STATUS.FINALIZADO) {
                throw new Error("No se puede apostar a un evento finalizado.");
            }

            const outcome = { official_odds: 2.0 };

            const id_bet = crypto.randomUUID();
            const now = new Date();
            let begin_date = data.begin_date ?? now.toLocaleDateString() + " " + now.toLocaleTimeString();
            let status = data.status ?? BET_STATUS.EN_PROCESO;

            if (!data.status && event.sport.startsWith("1 vs 1")) {
                begin_date = null;
                status = BET_STATUS.ENVIADA;
            }
            const end_date = null;
            const result = null;
            const category = event.sport;
            const user = db.prepare(`SELECT balance FROM users WHERE id_user = ?`).get(id_user_token);

            if(user.balance < data.amount){
                throw new Error("El usuario no tiene saldo suficiente para apostar");
            }

            db.prepare(`UPDATE users SET balance= balance - ? WHERE id_user = ?`).run(data.amount, id_user_token);
            const betData = {
                id_bet,
                id_user: id_user_token,
                ...data,
                extra: outcome.official_odds,
                category,
                result,
                status,
                begin_date,
                end_date
            };

            const fields = Object.keys(betData).join(", ");
            const places = Object.keys(betData).map(() => "?").join(", ");
            const values = Object.values(betData);

            db.prepare(`INSERT INTO bets (${fields}) VALUES(${places})`).run(...values);

            return db.prepare(`SELECT * FROM bets WHERE id_bet = ?`).get(id_bet);

        } catch (error) {
            console.error("Error al crear la apuesta tipo 1 vs 1", error);
            throw error;
        }
    }

    // POST
    static async createBet({ data, id_user_token}) {
        try {
            const event = db.prepare(`SELECT * FROM events WHERE id_event = ?`).get(data.id_event);
            if (event.status === EVENT_STATUS.FINALIZADO) {
                throw new Error("No se puede apostar a un evento finalizado.");
            }
            console.log("outcome id:", data.id_outcome)

            // Obtener momio desde event_outcomes
            const outcome = db.prepare(`
                  SELECT official_odds FROM event_outcomes 
                  WHERE id_outcome = ? AND id_event = ?
                `).get(data.id_outcome, data.id_event);
            console.log("outcome recibido", outcome)
            if (!outcome) {
                throw new Error("El outcome no existe para este evento.");
            }


            const id_bet = crypto.randomUUID();
            const now = new Date();
            let begin_date = data.begin_date ?? now.toLocaleDateString() + " " + now.toLocaleTimeString();
            let status = data.status ?? BET_STATUS.EN_PROCESO;
            /*
                Hago esto para que cuando se envie la apuesta del tipo 1 vs 1 el status sea "enviado" pero para que
                 cuando la acepte el otro su apuesta creada no vuelva a tener el estado de "enviado" porque uso el mismo
                metodo para crear una apuesta en acceptBet
            */
            if (!data.status && event.sport.startsWith("1 vs 1")) {
                begin_date = null;
                status = BET_STATUS.ENVIADA;
            }
            const end_date = null;
            const result = null;
            const category = event.sport;
            const user = db.prepare(`SELECT balance FROM users WHERE id_user = ?`).get(id_user_token);

            if(user.balance < data.amount){
                throw new Error("El usuario no tiene saldo suficiente para apostar");
            }
            //descontar el balance la apuesta

            db.prepare(`UPDATE users SET balance= balance - ? WHERE id_user = ?`).run(data.amount,id_user_token);
            const betData = {
              id_bet,
                id_user:id_user_token,
              ...data,
                extra: outcome.official_odds,
                category,
              result,
              status,
              begin_date,
              end_date
            };
            //Esta parte hace que no tengamos que escribir campo por campo en la consulta SQL, lo va concatenando y funciona igual en createEvent
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

    // DELETE no esta hecho
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

}
