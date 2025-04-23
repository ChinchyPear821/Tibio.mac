import { Router } from "express";

import { EventController } from "../Controller/event.js";

export const routEvent = new Router();

//GET
routEvent.get("/", EventController.getAllEvents);
routEvent.get("/search", EventController.searchEvents);
routEvent.get("/:id", EventController.getEventById);
routEvent.get("/current", EventController.allCurrentEvents);

routEvent.get("/:id_event/outcomes", EventController.getOutcomesByEventId);
//POST
routEvent.post("/", EventController.createEvent)

//PATCH
routEvent.patch("/close", EventController.closeEvent);
//DELETE

routEvent.delete("/:id_event", EventController.deleteEvent)