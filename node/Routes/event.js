import { Router } from "express";

import { EventController } from "../Controller/event.js";

export const eventRouter = new Router();

//GET
eventRouter.get("/search", EventController.searchEvents);
eventRouter.get("/:id", EventController.getEventById);

//POST
eventRouter.post("/", EventController.createEvent)

//PATCH
eventRouter.patch("/close", EventController.closeEvent);