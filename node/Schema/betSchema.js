import { z } from 'zod';
import {BET_TYPES} from "../utils/consts.js";
// Regex para validar fecha y hora
const dateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?$/;

export const betSchema = z.object({
    id_bet: z.string().uuid().optional(),
    id_user: z.string().uuid(),
    id_event: z.string().uuid(),
    category: z.string().optional(),
    type: z.enum(BET_TYPES),
    amount: z.number().positive(),
    extra: z.number(),
    status: z.enum(["EN PROCESO", "FINALIZADA", "ENVIADA"]).default("EN PROCESO"),
    result: z.string().nullable().optional(),
    begin_date: z.string().regex(dateTimeRegex).default(() => new Date().toISOString()),
    end_date: z.string().regex(dateTimeRegex).nullable().optional(),
});

export function validateBet(object) {
    return betSchema.safeParse(object);
}

export function validatePartialBet(object) {
    return betSchema.partial().safeParse(object);
}
