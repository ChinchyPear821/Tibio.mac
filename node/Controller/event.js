import { EventModel } from "../Model/event.js";
import {eventSchema, validatePartialEvent, validateEvent} from "../Schema/eventSchema.js";

export class EventController{
    // GET
    static async getEventById(req, res){
        try{
            const id_event = req.params;
            const event = await EventModel.getEventById(id_event);
            if(!event){
                return res.status(400).json({error: "No se encontro el evento"})
            }
            return res.status(200).json(event);
        }catch(error){
            return res.status(400).json({error: "Error al encontrar el evento"})
        }
    }
    // GET
    static async searchEvents(req, res){
        try{
            const filters = req.query;
            if(!filters || Object.keys(filters).length === 0){
                return res.status(400).json({error: "No se recibieron filtros"})
            }
            const results = await EventModel.search(filters)
            return res.status(200).json(results);
        }catch (error){
            return res.status(400).json({error: "Error encontrando los datos"})
        }
    }
    // POST
    static async createEvent(req, res){
        try{
            const validatedEvent = validateEvent(req.body);

            if(!validatedEvent.success){
                return res.status(400).json({error: validatedEvent.error.errors})
            }
            const eventCreated = await EventModel.createEvent({data:validatedEvent.data});
            return res.status(200).json(eventCreated);
        }catch(error){
            console.error("Error inesperado:", error);
            return res.status(400).json({ error: error.message });
        }
    }
    // PATCH
    static async closeEvent(req, res){
        try{
            const validatedEvent = validatePartialEvent(req.body);
            if(!validatedEvent.success){
                return res.status(400).json({error: "Error al buscar el evento"})
            }

            const {id_event, result} = validatedEvent.data;
            const eventClosed = await EventModel.closeEvent(id_event, result);
            return res.status(200).json(eventClosed);
        }catch(error){
            return res.status(400).json({error: error.message});

        }
    }
    // No hay DELETE

}