import z, { optional } from "zod"

const userSquema = z.object({
    id: z.string().uuid().optional(),
    username: z.string(),
    password: z.string()
})

export function validateUsername(object){
    //.safeParse(object) => 
    // {success: true/false, data: object/error: ZodError}
    return userSquema.safeParse(object)
}