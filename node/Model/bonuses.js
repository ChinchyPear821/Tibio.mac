import { db } from "../Connection/db.js";
import crypto from "crypto";

export class BonusModel {
    static createBonus({ amount, type }) {
        const id_bonus = crypto.randomUUID();
        const status = "activo";
        db.prepare(`
            INSERT INTO bonuses(id_bonus, amount, type, status)
            VALUES (?, ?, ?, ?)
        `).run(id_bonus, amount, type, status);
        return db.prepare(`SELECT * FROM bonuses WHERE id_bonus = ?`).get(id_bonus);
    }

    static getAllBonuses() {
        return db.prepare(`SELECT * FROM bonuses`).all();
    }

    static getBonusesByUser(id_user) {
        const allBonuses = db.prepare(`SELECT * FROM bonuses`).all();

        const redeemed = db.prepare(`
            SELECT * FROM user_bonuses WHERE id_user = ?
        `).all(id_user);

        const redeemedMap = {};
        redeemed.forEach(entry => {
            redeemedMap[entry.id_bonus] = {
                status: entry.status,
                redeemed_date: entry.redeemed_date
            };
        });

        return allBonuses.map(bonus => {
            const userBonus = redeemedMap[bonus.id_bonus];
            return {
                ...bonus,
                status: userBonus?.status || "pendiente",
                redeemed_date: userBonus?.redeemed_date || null
            };
        });
    }

    static redeemBonus({ id_bonus, id_user }) {
        const existing = db.prepare(`
            SELECT * FROM user_bonuses WHERE id_user = ? AND id_bonus = ?
        `).get(id_user, id_bonus);

        if (existing) throw new Error("Este bono ya fue canjeado por el usuario");

        const bonus = db.prepare(`SELECT * FROM bonuses WHERE id_bonus = ?`).get(id_bonus);
        if (!bonus) throw new Error("El bono no existe");

        const now = new Date();
        const redeemed_date = now.toLocaleDateString() + " " + now.toLocaleTimeString();

        db.prepare(`
            INSERT INTO user_bonuses(id_user, id_bonus, status, redeemed_date)
            VALUES (?, ?, 'canjeado', ?)
        `).run(id_user, id_bonus, redeemed_date);

        db.prepare(`UPDATE users SET balance = balance + ? WHERE id_user = ?`)
            .run(bonus.amount, id_user);

        return { ...bonus, status: "canjeado", redeemed_date };
    }

    static deleteBonus(id_bonus) {
        db.prepare(`DELETE FROM user_bonuses WHERE id_bonus = ?`).run(id_bonus);
        return db.prepare(`DELETE FROM bonuses WHERE id_bonus = ?`).run(id_bonus);
    }
}
