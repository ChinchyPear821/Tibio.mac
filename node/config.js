import dotenv from "dotenv"

dotenv.config()

export const PORT = process.env.PORT
export const SECRET_JWT_KEY = process.env.SECRET_JWT_KEY
export const DATABASE_PATH_SAUL = process.env.DATABASE_PATH_SAUL