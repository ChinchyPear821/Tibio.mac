import z from "zod";

const transactionSchema = z.object({
    id_user: z.string().uuid(),
    cardNumber: z.number().min(10**12).max(10**16-1), //minimo de 13 maximo de 16
    cardPassword: z.number().min(100).max(999), //3 digitos numericos
    bank: z.enum(
        ["HSBC", "BANAMEX", "INBURSA", "BBVA", "SANTANDER",
        "SCOTIABANK"]
    ),
    amount: z.number().min(1).multipleOf(0.01), // centavos
    type: z.enum(["DEPOSITO", "RETIRO"])
});

export function validateTransaction(object) {
    return transactionSchema.safeParse(object)
}

export function partialValidateTransaction(object){
    return transactionSchema.partial().safeParse(object)
}