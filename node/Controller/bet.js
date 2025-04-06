import { BetModel } from "../Model/bet.js";
import {betSchema, validateBet, validatePartialBet} from "../Schema/betSchema.js";

export class BetController {
    // GET
    static async allBets(req, res) {
        try {
            const bets = await BetModel.getAllBets();
            return res.status(200).json(bets);
        } catch (error) {
            return res.status(400).json({ error: "Error al obtener las apuestas" });
        }
    }
    static async search(req, res){
        try {
            const filters = req.query;
            if(!filters || Object.keys(filters).length === 0){
                return res.status(400).json({error: "No hay filtros"});
            }
            const results = await BetModel.search(filters);
            return res.status(200).json(results);
        }catch (error){
            return res.status(400).json({error: error.message});
        }
    }
    //✅
    static async getBetById(req, res) {
        try {
            const id_bet = req.params;
            if (!id_bet) {
                return res.status(422).json({ error: "Falta el ID de la apuesta" });
            }
            const result = await BetModel.getBetById(id_bet);
            return res.status(200).json(result);
        } catch (error) {
            console.error("Error al buscar la apuesta", error);
            return res.status(500).json({ error: "Apuesta no encontrada" });
        }
    }

    // POST
    static async acceptBet(req, res) {
        try {
            const {id_bet, id_user} = req.body;
            if (!id_bet || !id_user) {
                return res.status(400).json({ error: "Apuesta no encontrada" });
            }

            const betAccepted = await BetModel.acceptBet(id_bet, id_user);
            return res.status(200).json(betAccepted);
        } catch (error) {
            console.error("Error al aceptar la apuesta", error);
            return res.status(500).json({ error: "Error al aceptar la apuesta" });
        }
    }

    //✅
    static async createBet(req, res) {
        try {
            const validatedBet = validatePartialBet(req.body);
            if(!validatedBet.success){
                return res.status(400).json({error: "Error al obtener los datos de la apuesta"})
            }

            const betCreated = await BetModel.createBet({data:validatedBet.data});
            return res.status(200).json(betCreated);

        } catch (error) {
            console.error("Error al crear una apuesta", error);
            res.status(500).json({ error: "Error al crear una apuesta" });
        }
    }

    // DELETE
    static async deleteBet(req, res) {
        try {

        } catch (error) {
            return res.status(500).json({ error: "Error al eliminar la apuesta" });
        }
    }
}
