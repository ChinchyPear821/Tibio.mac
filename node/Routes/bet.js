import { Router } from "express";

import { BetController } from "../Controller/bet.js";

export const routBet = Router()
// GET
routBet.get("/", BetController.allBets);
routBet.get("/user/", BetController.allBetsByUserId);
routBet.get("/events", BetController.allEvents);
routBet.get("/events/current", BetController.allCurrentEvents); // <-- antes
routBet.get("/events/:id_event/outcomes", BetController.getOutcomesByEventId); // <-- antes
routBet.get("/events/:id_event", BetController.getEventById); // <-- después
routBet.get("/:id_bet", BetController.getBetById);

// PUT (para actualizar eventos)
routBet.put("/events/:id_event", BetController.patchEvent);

// POST
routBet.post("/events", BetController.createEvent)
routBet.post("/", BetController.createBet)

// PATCH
routBet.patch("/place", BetController.acceptBet)
// DELETE
routBet.delete("/:id_bet", BetController.deleteBet)
routBet.delete("/events/:id_event", BetController.deleteEvent)