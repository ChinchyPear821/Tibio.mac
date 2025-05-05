import { Router } from "express";
import {BonusController} from "../Controller/bonuses.js";
import {authenticateToken} from "../utils/functions.js";

export const routBonus = new Router();

routBonus.post("/", BonusController.createBonus);
routBonus.get("/user",authenticateToken, BonusController.getBonusesByUser);
routBonus.post("/redeem/:id_bonus", authenticateToken, BonusController.redeemBonus);
routBonus.delete("/:id_bonus", BonusController.deleteBonus);

