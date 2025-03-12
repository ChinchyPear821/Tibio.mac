import z, { object } from "zod"

const userSchema = z.object({
    id_user: z.string().uuid().optional(),
    username: z.string().min(3).max(20),
    email: z.string().email(),
    password: z.string().min(6)
})

export function validateUsername(object){
    //.safeParse(object) => 
    // {success: true/false, data: object/error: ZodError}
    return userSchema.safeParse(object)
}

export function partialValidateUsername(object){
    return userSchema.partial().safeParse(object)
}