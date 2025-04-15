import {SportStatsModel} from "../Model/sports.js";

export class SportsStatsController{
    static async createStats(req,res){
        try {
            const { type, data } = req.body;
            const result = await SportStatsModel.createStats({ type, data });
            res.status(201).json(result);
        } catch (error) {
            console.error("Error al crear estadísticas:", error);
            res.status(400).json({ error: error.message });
        }
    }
    static async updateStats(req,res){
        try {
            const { type, id_event, data } = req.body;
            const result = await SportStatsModel.updateStats({ type, id_event, data });
            res.status(200).json(result);
        } catch (err) {
            console.error("Error al actualizar estadísticas:", err);
            res.status(400).json({ error: err.message });
        }
    }

    static async getStats(req,res){
        try {
            const { type, id_event } = req.query;
            const result = await SportStatsModel.getStats({ type, id_event });
            res.status(200).json(result);
        } catch (err) {
            console.error("Error al obtener estadísticas:", err);
            res.status(400).json({ error: err.message });
        }
    }
}