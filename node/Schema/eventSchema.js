import {z} from 'zod';
import {EVENT_RESULTS} from "../utils/consts.js";

const dateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?$/;

export const eventSchema =z.object({
   id_event: z.string().uuid().optional(),
   name: z.string().min(1),
   status: z.enum(["EN PROCESO", "FINALIZADA"]),
    sport: z.string().min(1),
    extra: z.number().nullable().optional(),
    result: z.enum(EVENT_RESULTS).nullable().optional(),
    begin_date:z.string().regex(dateTimeRegex).nullable().optional().default(() => new Date().toISOString()),
    end_date: z.string().regex(dateTimeRegex).nullable().optional(),
});

export function validateEvent(object){
    return eventSchema.safeParse((object));
}

export function validatePartialEvent(object){
    return eventSchema.partial().safeParse(object);
}