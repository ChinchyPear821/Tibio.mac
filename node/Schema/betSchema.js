import z from "zod";

const betSchema = z.object({
    id_user: z.string().uuid(),
    id_event: z.string().uuid(),
    type: z.enum([]),
    amount: z.number().positive(),
    extra: z.number(),
    status: z.enum(["EN PROCESO", "FINALIZADA"]),
    //date: z.string()
    //hour: z.string()
});

export function validateBet(object){
    return betSchema.safeParse(object)

}
export function validatePartialBet(object){
    return betSchema.partial().safeParse(object)
}
