import {Router} from 'express';
import {SportsStatsController} from "../Controller/sports.js";

export const routSports= Router();
//estas rutas son solo para crear las estadisticas y deberian ser solo visibles para nosotros
routSports.post("/", SportsStatsController.createStats);
routSports.patch("/", SportsStatsController.updateStats);

routSports.get("/", SportsStatsController.getStats);