import { Router } from "express";

import { BetController } from "../Controller/bet.js";

export const routBet = Router()
// GET
routBet.get("/search", BetController.search)
routBet.get("/",BetController.allBets)
routBet.get("/:id", BetController.getBetById)//si

// POST
routBet.post("/", BetController.createBet)

// PATCH
routBet.patch("/place", BetController.acceptBet)
// DELETE
routBet.delete("/:id", BetController.deleteBet)