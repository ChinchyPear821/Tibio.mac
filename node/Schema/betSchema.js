import { z } from 'zod';
import { BET_STATUS, CATEGORY} from "../utils/consts.js";

export const betSchema = z.object({
    id_bet: z.string().uuid().optional(),
    id_user: z.string().uuid().optional(), // se saca del token
    id_event: z.string().uuid(), // se pide en el body
    id_outcome: z.string().uuid(),
    category: z.enum(Object.values(CATEGORY)).optional(), // se obtiene del evento creado
    type: z.enum(
        ["ganador", "goles", "tarjetas amarillas", "tiros esquina", "tarjetas rojas",
                "puntos totales", "triples", "rebotes",
                "touchdowns", "sacks","goles de campo", "intercepciones"]), //se pide en el body
    target: z.string().min(1), //se pide en el body
    amount: z.number().positive(), //se pide en el body
    extra: z.number(), //se pide en el body
    status: z.enum(Object.values(BET_STATUS)).default("EN PROCESO"),
    result: z.string().nullable().optional(),
    begin_date: z.string().nullable().optional(),
    end_date: z.string().nullable().optional(),
});

export function validateBet(object) {
    return betSchema.safeParse(object);
}

export function validatePartialBet(object) {
    return betSchema.partial().safeParse(object);
}
