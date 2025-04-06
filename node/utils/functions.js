import { db } from "../Connection/db.js";
import {EVENT_STATUS, BET_STATUS, EVENT_RESULTS} from "./consts.js";

export function monitorBets(interval = 60000){
    setInterval(()=>{
        console.log("[Buscando Eventos en Proceso]...");
        try{
            const finalizedEvents = db.prepare(`SELECT * FROM events WHERE status =?`).
                all(EVENT_STATUS.FINALIZADO);
            if (!finalizedEvents.length){
                console.log("No hay eventos finalizados");
                return;
            }

            finalizedEvents.forEach((event)=>{
                const bets = db.prepare(`SELECT * FROM bets WHERE id_event = ? AND status = ?`)
                    .all(event.id_event, BET_STATUS.EN_PROCESO)
                if(!bets.length){
                    return;
                }
                bets.forEach((bet)=>{
                    const now = new Date().toISOString();
                    const result = event.result ?? EVENT_RESULTS.PENDIENTE;

                    db.prepare(`UPDATE bets
                                    SET status = ?, result = ?, end_date = ?
                                    WHERE id_bet = ?`
                    ).run(BET_STATUS.FINALIZADO, result, now,bet.id_bet);

                    console.log(`[Actualizacion de apuesta ${bet.id_bet} a Finalizada]`)
                });
            });
            console.log("[Proceso completo]");
       } catch (error){
            console.log("[[Error al iniciar a verificar eventos]]");
       }
    },60000);
}