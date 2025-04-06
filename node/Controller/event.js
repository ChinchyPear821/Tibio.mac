import { EventModel } from "../Model/event.js";
import {eventSchema, validatePartialEvent} from "../Schema/eventSchema.js";

export class EventController{
    //✅
    static async getEventById(req, res){
        try{
            const id_event = req.params;
            const event = await EventModel.getEventById(id_event);
            if(!event){
                return res.status(400).json({error: error.message})
            }
            return res.status(200).json(event);
        }catch(error){
            return res.status(400).json({error: "No se encontro el evento"})
        }
    }
    //✅
    static async searchEvents(req, res){
        try{
            const filters = req.query;
            if(!filters || Object.keys(filters).length === 0){
                return res.status(400).json({error: "Error, no se recibieron parametros"})
            }
            const results = await EventModel.search(filters)
            return res.status(200).json(results);
        }catch (error){
            return res.status(400).json({error: "Error encontrando los datos"})
        }
    }
    //✅
    static async createEvent(req, res){
        try{
            const validateEvent = validatePartialEvent(req.body);
            if(!validateEvent.success){
                return res.status(400).json({error: "Error al intentar crear un nuevo usuario"})
            }

            const validateData = validateEvent.data;
            const eventCreated = await EventModel.createEvent({data:validateData});
            return res.status(200).json(eventCreated);
        }catch(error){
            return res.status(400).json({error:"Error al crear el evento"})
        }
    }

    static async closeEvent(req, res){
        try{
            const {id_event, result} = req.body;
            if(!id_event || !result){
                return res.status(400).json({error: "Error al buscar el evento"})
            }
            const eventClosed = await EventModel.closeEvent(id_event, result);
            return res.status(200).json(eventClosed);
        }catch(error){

        }
    }


}