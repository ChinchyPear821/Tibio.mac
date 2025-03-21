import { BetModel } from "../Model/bet.js"
import {validateBet, validatePartialBet} from "../Schema/betSchema.js";

export class BetController{
    //GET
    static async allBets(req, res){
        try{
            const bets = await BetModel.getAllBets()
            return res.status(200).json(bets)

        }catch(error){
            return res.status(400).json({error: "Error al obtener las apuestas"})
        }
    }
    static async allEvents(req, res){
        try{
            const events = await BetModel.getAllEvents()
            return res.status(200).json(events)
        }catch(error){
            return res.status(400).json({error: "Error al obtener los eventos"})
        }
    }
    static async allBetsByUserId(req, res){
        try{
            const user = req.body

            if (user.error){
                return res.status(422).json({ error: validateBet.error.message });
            }
            //me regresa un aray de todas las apuestas
            const bets = await BetModel.getAllBetsByUserId({ data: user })

            return res.status(200).json(bets)
            
        } catch(error){
            console.error("Error al buscar el historial de apuestas", error)
            return res.status(500).json({ error: "Error al buscar el historial de apuestas" })
        }
    }

    static async getBetById(req, res){
        try{
            const bet = req.body

            if (bet.error){
                return res.status(422).json({ error: "Error" });
            }

            const result = await BetModel.getBetById({ data: bet })

            return res.status(200).json(result)

        } catch(error){
            console.error("Error al buscar la apuesta", error)
            return res.status(500).json({ error: "Apuesta no encontrada" })
        }
    }

    static async getEventById(req, res){
        try{
            const event = req.body

            if (event.error){
                return res.status(422).json({ error: "Error" });
            }

            const result = await BetModel.getEventById({ data: event })

            return res.status(200).json(result)

        } catch(error){
            console.error("Error al buscar el evento", error)
            return res.status(500).json({ error: "Apuesta no encontrada" })
        }
    }

    //POST
    static async acceptBet(req, res){
        try{
            const {id_bet, id_user} = req.body
            if(!id_user||!id_bet){
                return res.status(400).json({error:"Faltan datos"})
            }


            const betAccepeted = await BetModel.acceptBet({data:{id_bet, id_user}});

            //Me regresa el id de la apuesta, el evento, el tipo, el monto y el momio. (si acaso contra quien)
            //const bet = await BetModel.place({ data: })

            return res.status(200).json(betAccepeted)

        }catch(error){
            console.error("Error al crear una apuesta", error)
           return res.status(500).json({ error: "Error al aceptar la apuesta" })
        }
    }
    static async createEvent(req, res){
        try{
            const {name, status, sport} = req.body
            if(!name || !status||!sport){
                return res.status(400).json({ error: "Apuesta no encontrada" })
            }
            const event = await BetModel.createEvent({data: {name, status, sport}})
            return res.status(200).json(event)

        }catch(error){
            console.error("Error al crear el evento", error)
            res.status(500).json({ error: "Error al crear una apuesta 1 a 1" })
        }
    }
    static async createBet(req, res) {
        try {
            req.body.status = "EN PROCESO";
            req.body.date = new Date().toISOString().split("T")[0];
            req.body.hour = new Date().toISOString().split("T")[1].split(".")[0]
            req.body.result = null

            const betValidated = validateBet(req.body);
            if (betValidated.error) {
                return res.status(422).json({ error: betValidated.error.message });
            }

            const betCreated = await BetModel.createBet({ data: betValidated.data });

            return res.status(200).json(betCreated);
        } catch (error) {
            console.error("Error al crear una apuesta", error);
            res.status(500).json({ error: "Error al crear una apuesta" });
        }
    }

    // DELETE
    static async deleteBet(req, res){
        try{
            const {id_bet} = req.body
            if(!id_bet){
                return res.status(400).json({ error: "No se encontró el Id" })
            }
            const result = await BetModel.deleteBet(id_bet);
            if (result === 0) {
                return res.status(404).json({ error: "Apuesta no encontrada 2" });
            }

            return res.status(200).json({ message: "Apuesta eliminada correctamente" });
        }catch(error){
            console.error("Error al eliminar la apuesta", error)
            return  res.status(500).json({ error: "Error al eliminar la apuesta" })
        }
    }
    static async deleteEvent(req, res){
        try{
            const {id_event} = req.body
            if(!id_event){
                return res.status(400).json({ error: "No se encontró el Id" })
            }
            const result = await BetModel.deleteEvent(id_event);
            if (result === 0) {
                return res.status(404).json({ error: "Evento no encontrado" });
            }

            return res.status(200).json({ message: "Evento eliminado correctamente" });
        }catch(error){
            console.error("Error al eliminar el evento", error)
            return  res.status(500).json({ error: "Error al eliminar el evento" })
        }
    }
}