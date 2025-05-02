import {BonusModel} from "../Model/bonuses.js";

export class BonusController {
    static async createBonus(req, res) {
        try {
            const bonus = await BonusModel.createBonus(req.body);
            return res.status(201).json(bonus);
        } catch (error) {
            return res.status(400).json({ error: "Error al crear el bono" });
        }
    }

    static async getBonusesByUser(req, res) {
        try {
            const bonuses = await BonusModel.getBonusesByUser(req.params.id_user);
            return res.status(200).json(bonuses);
        } catch (error) {
            return res.status(400).json({ error: "Error al obtener los bonos del usuario" });
        }
    }

    static async redeemBonus(req, res) {
        try {
            console.log("Datos recibidos", req.params.id_bonus, req.user.id_user)
            const bonus = await BonusModel.redeemBonus({id_bonus  :req.params.id_bonus, id_user_token : req.user.id_user});
            return res.status(200).json(bonus);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    static async deleteBonus(req, res) {
        try {
            const result = await BonusModel.deleteBonus(req.params.id_bonus);
            return res.status(200).json({ message: "Bono eliminado correctamente", changes: result.changes });
        } catch (error) {
            return res.status(400).json({ error: "Error al eliminar el bono" });
        }
    }
}
