import express, {json} from "express"
import cors from "cors"

import { routUser } from "./Routes/user.js"

const app = express()

app.disable("x-powered-by")

app.use(json())
app.use(cors())

//ruta de Login
app.use("/user", routUser)

//ruta de Apuestas


//Puerto temporal
const PORT = 1234

app.listen(PORT, () =>{
    console.log("http://localhost:1234")
})