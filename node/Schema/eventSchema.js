import {z} from 'zod';
import {EVENT_RESULTS, EVENT_STATUS, CATEGORY} from "../utils/consts.js";

export const eventSchema = z.object({
   id_event: z.string().uuid().optional(),
   name: z.string().min(1).nullable(), //se  pide en el body
   status: z.enum(Object.values(EVENT_STATUS)).default(EVENT_STATUS.EN_PROCESO),
    sport: z.enum(Object.values(CATEGORY)).nullable(), // se pide en el body
    result: z.enum(Object.values(EVENT_RESULTS)).nullable().optional(),
    begin_date:z.string().nullable().optional(),
    end_date: z.string().nullable().optional(),
});

export function validateEvent(object){
    return eventSchema.safeParse((object));
}

export function validatePartialEvent(object){
    return eventSchema.partial().safeParse(object);
}