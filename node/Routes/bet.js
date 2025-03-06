import { Router } from "express";

import { BetController } from "../Controller/bet.js";

export const routBet = Router()

//Post
routBet.post("/place", BetController.place) //aceptar una apuesta
routBet.post("/create", BetController.create) //crear una apuesta 1 a 1

//Get
routBet.post("/user/:id", BetController.allBets) //todas las apuestas de un usuario