import { Router } from "express";

import { EventController } from "../Controller/event.js";

export const routEvent = new Router();

//GET
routEvent.get("/search", EventController.searchEvents);
routEvent.get("/:id", EventController.getEventById);

//POST
routEvent.post("/", EventController.createEvent)

//PATCH
routEvent.patch("/close", EventController.closeEvent);