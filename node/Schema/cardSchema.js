import z from "zod"

const cardSchema = z.object({
    id_user: z.string().uuid(),
    cardName: z.string(),
    cardNumber: z.number().min(10**12).max(10**16-1),
    cardExpiration: z.string(),
    cardPassword: z.number().min(100).max(999),
    bank: z.enum(
        ["HSBC", "BANAMEX", "INBURSA", "BBVA", "SANTANDER",
        "SCOTIABANK"]
    )
});

export function validateCard(object){
    return cardSchema.safeParse(object)
}

export function partialValidateCard(object){
    return cardSchema.partial().safeParse(object)
}