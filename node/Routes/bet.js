import { Router } from "express";

import { BetController } from "../Controller/bet.js";
import {authenticateToken} from "../utils/functions.js";

export const routBet = Router()
// GET
routBet.get("/search/auth",authenticateToken, BetController.searchWithToken) // este se usa para buscar usando el token del usuario siempre y puedes añadir mas parametros
routBet.get("/search", BetController.search) //Este se usa para buscar en general por cualquier filtro
routBet.get("/",BetController.allBets)
routBet.get("/:id", BetController.getBetById)

// POST
routBet.post("/", authenticateToken,BetController.createBet)

// PATCH
routBet.patch("/place", authenticateToken, BetController.acceptBet)
// DELETE no sirve
routBet.delete("/:id", BetController.deleteBet)