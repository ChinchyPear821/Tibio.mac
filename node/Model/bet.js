import { db } from "../Connection/db.js"
import {all} from "express/lib/application.js";

export class BetModel{
    //GET
    static async allBets({ data }){
        try{
            const { id_user } = data;
            const bets = db.prepare(`
                SELECT * FROM bets WHERE id_user = ?`
            );
            return bets.run(id_user);
        }catch(error){
            console.log("Error al obtener las apuestas del usuario:", error);
            throw error
        }
    }
    //GET
    static async getBetById({data}){
        try{
            const {id_bet} = data
            const bet = db.prepare(`SELECT * FROM bets WHERE id_bet = ?`
            );

            return bet.run(id_bet)
        }catch(error){
            console.log("No se encontro la apuesta con el id", id_bet, error)
            throw error
        }
    }

    //POST
    static async place({ data }){

    }
    static async createBet({ data }){
        try{
            const {id_user, id_event, type, amount, extra} = data;
            const uuid = crypto.randomUUID();
            const status = "EN PROCESO"
            const result = null
            const date  = new Date().toISOString().split("T")[0];
            const hour = new Date().toISOString().split("T")[1].split(".")[0];

            console.log("Creando la apuesta: ", uuid, id_user, id_event, type, amount, extra, status, date, hour)

            const createBet = db.prepare(`INSERT INTO bets (
            id_bet, id_user, id_event, type, amount, extra, status, result, date, hour)
            VALUES(?,?,?,?,?,?,?,?,?,?)`
            );

            createBet.run(uuid, id_user, id_event, type, amount, extra, status, date, hour);

            return console.log("Apuesta creada correctamente");
        }

        catch(error){
            console.log("Error al crear la apuesta", error)
            throw error;
        }
    }
}