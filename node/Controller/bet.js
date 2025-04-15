import { BetModel } from "../Model/bet.js";
import { validateBet, validatePartialBet} from "../Schema/betSchema.js";

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
    //GET para buscar siempre pasando un token del usuario y algun parametro o filtro extra
    static async searchWithToken(req, res){
        try {
            const params = req.query;
            const id_user_token = req.user?.id_user;
            const  filters= {
                ...params,
                id_user: id_user_token
            };
            const results = await BetModel.search(filters);
            return res.status(200).json(results);
        }catch (error){
            return res.status(400).json({error: error.message});
        }
    }
    // GET para buscar sin necesidad de mandar el token se puede usar para cuando no busque algo que no sea del usuario
    static async search(req, res){
        try {
            const params = req.query;
            if(params.length===0){
                return res.status(400).json({error:"No hay filtros"})
            }
            const results = await BetModel.search(params);
            return res.status(200).json(results);
        }catch (error){
            return res.status(400).json({error: error.message});
        }
    }
    // GET
    static async getBetById(req, res) {
        try {
            const {id_bet} = req.params;
            if (!id_bet) {
                return res.status(422).json({ error: "No se encontro el id" });
            }
            const result = await BetModel.getBetById(id_bet);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // PATCH
    static async acceptBet(req, res) {
        console.log("Token recibido:", req.headers.authorization);
        console.log("Usuario decodificado:", req.user);
        try {
             const validatedBet = validatePartialBet(req.body);
            if (!validatedBet.success) {
                return res.status(400).json({ error: "Apuesta no encontrada" });
            }
            const {id_bet} = validatedBet.data;
            const betAccepted = await BetModel.acceptBet(id_bet, req.user.id_user);
            return res.status(200).json(betAccepted);
        } catch (error) {
            return res.status(500).json({ error:error.message });
        }
    }

    // POST
    static async createBet(req, res) {
        try {
            const validatedBet = validatePartialBet(req.body);
            if(!validatedBet.success){
                return res.status(400).json({error: "Error al obtener los datos de la apuesta"})
            }

            const betCreated = await BetModel.createBet({
                data:validatedBet.data, id_user_token: req.user.id_user});

            return res.status(200).json(betCreated);
        } catch (error) {
            res.status(500).json({ error: error.message});
        }
    }

    // DELETE no hay
    static async deleteBet(req, res) {
        try {

        } catch (error) {
            return res.status(500).json({ error: "Error al eliminar la apuesta" });
        }
    }
}
