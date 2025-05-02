import { db } from "../Connection/db.js";
import crypto from "crypto";

export class BonusModel {
    static async createBonus({  amount, type }) {
        const id_bonus = crypto.randomUUID();
        const status = "pendiente";
        db.prepare(`
            INSERT INTO bonuses(id_bonus, amount, type, status)
            VALUES (?, ?, ?, ?)
        `).run(id_bonus, amount, type, status);
        return db.prepare(`SELECT * FROM bonuses WHERE id_bonus = ?`).get(id_bonus);
    }

    static async getBonusesByUser(id_user) {
        return db.prepare(`SELECT * FROM bonuses WHERE id_user = ?`).all(id_user);
    }

    static async redeemBonus({id_bonus, id_user_token}) {
        const bonus = db.prepare(`SELECT * FROM bonuses WHERE id_bonus = ?`).get(id_bonus);
        if (bonus.status === "canjeado") throw new Error("Este bono ya fue canjeado");
        const now = new Date();
        const redeemed_date = now.toLocaleDateString() + " " + now.toLocaleTimeString();
        db.prepare(`
            UPDATE bonuses
            SET status = 'canjeado', redeemed_date = ?, id_user = ?
            WHERE id_bonus = ?
        `).run(redeemed_date, id_user_token,id_bonus,);
        db.prepare(`UPDATE users SET balance = balance + ? 
                WHERE id_user = ?`).run(bonus.amount,id_user_token)
        return db.prepare(`SELECT * FROM bonuses WHERE id_bonus = ?`).get(id_bonus);
    }

    static async deleteBonus(id_bonus) {
        return db.prepare(`DELETE FROM bonuses WHERE id_bonus = ?`).run(id_bonus);
    }
}
