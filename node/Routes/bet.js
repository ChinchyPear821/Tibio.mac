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

routBet.post("/events", BetController.createEvent)
routBet.post("/", BetController.createBet)

// PATCH
routBet.patch("/place", BetController.acceptBet)
// DELETE
routBet.delete("/id", BetController.deleteBet)
routBet.delete("/events/id", BetController.deleteEvent)