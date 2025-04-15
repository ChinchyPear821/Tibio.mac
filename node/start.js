/*

Me quede con mi archivo de start.js porque no funcionaba con el de los ultimos cambios

*/
import express, {json} from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

import { SECRET_JWT_KEY , PORT} from "./config.js"
import jwt from "jsonwebtoken"
import { routUser } from "./Routes/user.js"
import { routBet } from "./Routes/bet.js"
import { routTransaction } from "./Routes/transaction.js"
import {routEvent} from "./Routes/event.js";
import {routSports} from "./Routes/sports.js";

import {monitorBets} from "./utils/functions.js";
const app = express()

app.disable("x-powered-by")

app.use(json())
app.use(cors())
app.use(cookieParser())

//Que todas las rutas pueden acceder a un token si es que hay uno
app.use((req, res, next) => {
    const token = req.cookies.access_token

    req.session = { user: null }

    try {
        const data = jwt.verify(token, SECRET_JWT_KEY)
        req.session.user = data
    } catch {}

    next();
})

//ruta de Login
app.use("/user", routUser)

//ruta de Apuestas
app.use("/bet", routBet)

//ruta de tarjetas
app.use("/transaction", routTransaction)

app.use("/event", routEvent)

app.use("/sports", routSports)

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`)
})
monitorBets();