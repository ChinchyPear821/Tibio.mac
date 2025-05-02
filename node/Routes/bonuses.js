import { Router } from "express";
import {BonusController} from "../Controller/bonuses.js";
import {authenticateToken} from "../utils/functions.js";

export const routBonus = new Router();

// POST
routBonus.post("/", BonusController.createBonus);

// GET
routBonus.get("/:id_user", BonusController.getBonusesByUser);

// PATCH
routBonus.patch("/redeem/:id_bonus",authenticateToken, BonusController.redeemBonus);

// DELETE
routBonus.delete("/:id_bonus", BonusController.deleteBonus);
