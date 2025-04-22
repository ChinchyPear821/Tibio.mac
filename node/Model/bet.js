import { array } from "zod";
import { db } from "../Connection/db.js"
const minutes = 3;
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

    static async getOutcomesByEventId(id_event) {
        try {
            // Aquí se consulta la base de datos para obtener los outcomes
            const outcomes = db.prepare(`
                SELECT * FROM event_outcomes WHERE id_event = ?
            `).all(id_event);

            return outcomes;  // Devuelve los outcomes obtenidos
        } catch (error) {
            console.error("Error al obtener outcomes por id_event:", error);
            throw error;
        }
    }

    //POST
    static async acceptBet({ data }){
        try {
            const { id_bet, id_user } = data;

            if (!id_bet || !id_user) {
                throw new Error("Datos incompletos para aceptar la apuesta");
            }

            const bet = db.prepare(`SELECT * FROM bets WHERE id_bet = ?`).get(id_bet);

            if (!bet) {
                throw new Error("La apuesta no existe");
            }

            if (bet.status !== "EN PROCESO") {
                throw new Error("La apuesta ya ha sido aceptada");
            }
            const updateBet = db.prepare(`
                UPDATE bets
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
    static async createEvent({ data }) {
        try {
            const { name, begin_date, sport, outcomes } = data;
            
    
            if (!name || !begin_date || !sport || !Array.isArray(outcomes)) {
                throw new Error("Datos incompletos");
            }
    
            if (isNaN(Date.parse(begin_date))) {
                throw new Error("Fecha inválida");
            }
    
            const id_event = crypto.randomUUID();
    
            const insertEvent = db.prepare(`
                INSERT INTO events (id_event, name, sport, begin_date)
                VALUES (?, ?, ?, ?)
            `);
            insertEvent.run(id_event, name, sport, begin_date);
    
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
    
            const event = db.prepare(`SELECT * FROM events WHERE id_event = ?`).get(id_event);
    
            return event;
        } catch (error) {
            console.error("Error al crear evento:", error);
            throw error;
        }
    }

    //PATCHARSE AL EVENTO
    static async patchEvent({ id_event, data }) {
        try {
            const { name, sport, status, result, end_date, outcomes } = data;
    
            if (!name  || !sport || !status || !result || !end_date ||!Array.isArray(outcomes)) {
                throw new Error("No se proporcionaron campos para actualizar");
            }

            if (name) {
                updateFields.push("name = ?");
                values.push(name);
            }
            if (sport) {
                updateFields.push("sport = ?");
                values.push(sport);
            }
            if (status) {
                updateFields.push("status = ?");
                values.push(status);
            }
            if (result) {
                updateFields.push("result = ?");
                values.push(result);
            }
            if (end_date) {
                updateFields.push("end_date = ?");
                values.push(end_date);
            }
    
            // 1. Actualizar solo los campos enviados (name, begin_date, sport)
            const updateFields = [];
            const values = [];
    
            if (name) {
                updateFields.push("name = ?");
                values.push(name);
            }
            if (sport) {
                updateFields.push("sport = ?");
                values.push(sport);
            }
            if (begin_date) {
                updateFields.push("begin_date = ?");
                values.push(begin_date);
            }
    
            if (updateFields.length > 0) {
                const updateQuery = `
                    UPDATE events
                    SET ${updateFields.join(", ")}
                    WHERE id_event = ?
                `;
                values.push(id_event);
                const updateStmt = db.prepare(updateQuery);
                updateStmt.run(...values);
            }
    
            // 2. Si vienen nuevos outcomes, eliminar los anteriores y guardar los nuevos
            if (Array.isArray(outcomes)) {
                const deleteStmt = db.prepare(`
                    DELETE FROM event_outcomes WHERE id_event = ?
                `);
                deleteStmt.run(id_event);
    
                const insertOutcome = db.prepare(`
                    INSERT INTO event_outcomes (id_outcome, id_event, outcome_name, official_odds)
                    VALUES (?, ?, ?, ?)
                `);
    
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
            }
    
            // 3. Obtener el evento actualizado
            const updatedEvent = db.prepare(`SELECT * FROM events WHERE id_event = ?`).get(id_event);
    
            return updatedEvent;
    
        } catch (error) {
            console.error("Error al actualizar evento:", error);
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

            console.log("Datos:", {
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
            const result= eventDelete.run(id_event);
            return result.changes;
        } catch (error) {
            console.error("No se encontro la apuesta", error);
            throw error;
        }
    }
}
function monitorBets() {
    setInterval(() => {
        try {
            console.log("[DEBUG] Verificando apuestas en proceso...");

            const bets = db.prepare(`
                SELECT * FROM bets WHERE status = 'EN PROCESO'
            `).all();

            if (!bets.length) {
                console.log("[DEBUG] No hay apuestas en proceso.");
                return;
            }

            const now = new Date();

            bets.forEach((bet) => {
                const betTime = new Date(`${bet.date}T${bet.hour}Z`); // Convertir a objeto Date
                const elapsedTime = (now - betTime) / 60000; // Convertir a minutos

                console.log(`[DEBUG] Apuesta ${bet.id_bet} tiene ${elapsedTime.toFixed(2)} minutos.`);

                if (elapsedTime >= minutes) {
                    console.log(` La apuesta ${bet.id_bet} ha finalizado.`);

                    // Generar un resultado aleatorio
                    const result = Math.random() > 0.5 ? "GANADO" : "PERDIDO";

                    // Actualizar apuesta y evento en una transacción
                    const updateTransaction = db.transaction(() => {
                        db.prepare(`
                            UPDATE bets SET status = 'FINALIZADO', result = ? WHERE id_bet = ?
                        `).run(result, bet.id_bet);

                        db.prepare(`
                            UPDATE events SET status = 'FINALIZADO' WHERE id_event = ?
                        `).run(bet.id_event);
                    });

                    updateTransaction();

                    console.log(`Apuesta ${bet.id_bet} y evento ${bet.id_event} actualizados a FINALIZADO.`);
                }
            });

            console.log("[DEBUG] Ciclo de verificación completado.");
        } catch (error) {
            console.error("Error en monitorBets:", error);
        }
    }, 60000); // Se ejecuta cada minuto
}

// Llamar la función cuando inicie el servidor
monitorBets();
