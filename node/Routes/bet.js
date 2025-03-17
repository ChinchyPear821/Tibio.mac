import { Router } from "express";

import { BetController } from "../Controller/bet.js";

export const routBet = Router()
// GET
routBet.get("/",BetController.allBets)
routBet.get("/user/", BetController.allBetsByUserId)
routBet.get("/events", BetController.allEvents)
routBet.get("/id", BetController.getBetById)
routBet.get("/events/id", BetController.getEventById)
// POST
routBet.post("/place", BetController.acceptBet)
routBet.post("/events", BetController.createEvent)
routBet.post("/", BetController.createBet)

// DELETE
routBet.delete("/id", BetController.deleteBet)