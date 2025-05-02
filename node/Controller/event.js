import { EventModel } from "../Model/event.js";
import {eventSchema, validatePartialEvent, validateEvent} from "../Schema/eventSchema.js";

export class EventController{
    static async getAllEvents(req,res){
        try {
            const events = await EventModel.getAllEvents();
            return res.status(200).json(events)
        }catch (error){
            return res.status(400).json({error: "Error al encontrar los eventos"})
        }
    }
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

            const { outcomes, ...eventData } = req.body;
            console.log("REQ.BODY ===>", req.body);

            const validatedEvent = validateEvent(eventData);

            if (!validatedEvent.success) {
                return res.status(400).json({ error: validatedEvent.error.errors });
            }

            if (!Array.isArray(outcomes) || outcomes.length === 0) {
                return res.status(400).json({ error: "Debes proporcionar al menos un outcome" });
            }
            for (const outcome of outcomes) {
                if (!outcome.outcome_name || isNaN(outcome.official_odds)) {
                    return res.status(400).json({ error: "Cada outcome debe tener un nombre y un momio numérico válido" });
                }
            }
            const eventCreated = await EventModel.createEvent({
                data: { ...validatedEvent.data, outcomes }
            });
            return res.status(200).json(eventCreated);
        }catch(error){
            console.error("Error inesperado:", error);
            return res.status(400).json({ error: error.message });
        }
    }

    //GET
    static async allCurrentEvents(req, res) {
        try {
            const events = await EventModel.getAllCurrentEvents();
            return res.status(200).json(events)
        } catch (error) {
            return res.status(400).json({ error: "Error al obtener los eventos" })
        }
    }
    //GET
    static async getOutcomesByEventId(req, res) {
        try {
            const { id_event } = req.params;  // Obtenemos el id_event de los parámetros de la URL

            if (!id_event) {
                return res.status(400).json({ error: "ID del evento es requerido" });
            }

            // Llamamos al modelo para obtener los outcomes por id_event
            const outcomes = await EventModel.getOutcomesByEventId(id_event);

            if (outcomes.length === 0) {
                return res.status(404).json({ error: "No se encontraron outcomes para este evento" });
            }

            // Respondemos con los outcomes obtenidos
            return res.status(200).json({ outcomes });
        } catch (error) {
            console.error("Error al obtener los outcomes:", error);
            res.status(500).json({ error: "Error interno al obtener outcomes" });
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

    //PATCH
    static async updateEvent(req, res) {
        try {
            const { id_event } = req.params;
            const validatedEvent = validatePartialEvent(req.body);

            if (!validatedEvent.success) {
                return res.status(400).json({
                    error: "Datos inválidos para actualizar evento",
                    issues: validatedEvent.error.issues
                });
            }

            const { name, status } = validatedEvent.data;

             if (!name && !status) {
                return res.status(400).json({
                    error: "Debes enviar al menos name o status para actualizar"
                });
            }

            const result = await EventModel.updateEvent({ id_event, name, status });

            if (result.changes === 0) {
                return res.status(404).json({ error: "Evento no encontrado" });
            }

            res.status(200).json({ message: "Evento actualizado correctamente" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async updateOutcomeOdds(req, res) {
        try {
            const { id_outcome } = req.params;
            const { official_odds } = req.body;

            if (official_odds === undefined) {
                return res.status(400).json({ error: "Falta official_odds en el body" });
            }

            const result = await EventModel.updateOutcomeOdds({ id_outcome, official_odds });

            if (result.changes === 0) {
                return res.status(404).json({ error: "Outcome no encontrado" });
            }

            res.status(200).json({ message: "Momio actualizado correctamente" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async updateOutcomesByIdEvent(req, res) {
        try {
            const { id_event } = req.params;
            const { outcomes } = req.body;
    
            if (!Array.isArray(outcomes) || outcomes.length === 0) {
                return res.status(400).json({ error: "Se esperaba un array de outcomes válido." });
            }
    
            const updatedOutcomes = await EventModel.updateOutcomesByIdEvent(id_event, outcomes);
    
            if (updatedOutcomes.length === 0) {
                return res.status(404).json({ error: "No se actualizaron outcomes. Verifica los datos." });
            }
    
            res.status(200).json({ message: "Momios actualizados correctamente", data: updatedOutcomes });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteEvent(req, res) {
        try {
            const { id_event } = req.body
            if (!id_event) {
                return res.status(400).json({ error: "No se encontró el Id" })
            }
            const result = await EventModel.deleteEvent(id_event);
            if (result === 0) {
                return res.status(404).json({ error: "Evento no encontrado" });
            }

            return res.status(200).json({ message: "Evento eliminado correctamente" });
        } catch (error) {
            console.error("Error al eliminar el evento", error)
            return res.status(500).json({ error: "Error al eliminar el evento" })
        }
    }

}