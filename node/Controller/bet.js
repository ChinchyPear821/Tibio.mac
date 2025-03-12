import { BetModel } from "../Model/bet.js"
import {validateBet, validatePartialBet} from "../Schema/betSchema.js";

export class BetController{
    //GET
    static async allBets(req, res){
        try{
            const validateBet = validateBet(req.body)

            if (validateBet.error){
                return res.status(422).json({ error: validateBet.error.message });
            }
            //me regresa un aray de todas las apuestas
            const bets = await BetModel.allBets({ data: user.id })

            res.status(200).json(bets)
            
        } catch(error){
            console.error("Error al buscar el historial de apuestas", error)
            res.status(500).json({ error: "Error al buscar el historial de apuestas" })
        }
    }

    //POST
    static async place(req, res){
        try{

            //Me regresa el id de la apuesta, el evento, el tipo, el monto y el momio. (si acaso contra quien)
            //const bet = await BetModel.place({ data: })

            res.status(200).json(bet)

        }catch(error){
            console.error("Error al crear una apuesta", error)
            res.status(500).json({ error: "Error al crear una apuesta" })
        }
    }
    static async create(req, res){
        try{

            //Me regresa el id de la apuesta, el evento, el tipo y el monto
            //const bet = await BetModel.create({ data: })
            
            res.status(200).json(bet)

        }catch(error){
            console.error("Error al crear una apuesta 1 a 1", error)
            res.status(500).json({ error: "Error al crear una apuesta 1 a 1" })
        }
    }
}