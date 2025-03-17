import z from "zod";

const betSchema = z.object({
    id_user: z.string().uuid(),
    id_event: z.string().uuid(),
    type: z.enum(["GANADOR", "PERDEDOR", "GOLES", "EMPATE"]),
    amount: z.number().positive(),
    extra: z.number(),
    status: z.enum(["EN PROCESO", "FINALIZADA"]).default("EN PROCESO"),
    result:z.string().nullable().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).default(new Date().toISOString().split("T")[0]),
    hour: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).default(new Date().toISOString().split("T")[1].split(".")[0]),
});

export function validateBet(object){
    return betSchema.safeParse(object)

}
export function validatePartialBet(object){
    return betSchema.partial().safeParse(object)
}
