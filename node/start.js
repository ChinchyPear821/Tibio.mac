import express, {json} from "express"
import cors from "cors"

import { routUser } from "./Routes/user.js"
import { routBet } from "./Routes/bet.js"
import { routTransaction } from "./Routes/transaction.js"
import {eventRouter} from "./Routes/event.js";
import {monitorBets} from "./utils/functions.js";

const app = express()

app.disable("x-powered-by")

app.use(json())
app.use(cors())

//ruta de Login
app.use("/user", routUser)

//ruta de Apuestas
app.use("/bet", routBet)

//ruta de tarjetas
app.use("/transaction", routTransaction)
app.use("/event", eventRouter)
//Puerto temporal
const PORT = 1234

app.listen(PORT, () =>{
    console.log("http://localhost:1234")
})
monitorBets();