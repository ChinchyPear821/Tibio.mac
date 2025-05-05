import { BonusModel } from "../Model/bonuses.js";

export class BonusController {
    static createBonus(req, res) {
        try {
            const { amount, type } = req.body;
            const bonus = BonusModel.createBonus({ amount, type });
            res.status(201).json(bonus);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static getBonusesByUser(req, res) {
        try {
            const id_user = req.user.id_user; // asumimos autenticación

            console.log("datos: ", id_user);
            const bonuses = BonusModel.getBonusesByUser(id_user);
            res.json(bonuses);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static redeemBonus(req, res) {
        try {
            const { id_bonus } = req.params;
            const id_user = req.user.id_user;
            const result = BonusModel.redeemBonus({ id_bonus, id_user });
            res.json(result);
        } catch (e) {
            res.status(400).json({ error: e.message });
        }
    }

    static deleteBonus(req, res) {
        try {
            const { id_bonus } = req.params;
            BonusModel.deleteBonus(id_bonus);
            res.json({ message: "Bono eliminado correctamente" });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
}
