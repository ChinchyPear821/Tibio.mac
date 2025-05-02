import express, {json} from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

import { SECRET_JWT_KEY , PORT} from "./config.js"
import jwt from "jsonwebtoken"
import {monitorBets} from "./utils/functions.js";
import { routUser } from "./Routes/user.js"
import { routBet } from "./Routes/bet.js"
import { routTransaction } from "./Routes/transaction.js"
import {routEvent} from "./Routes/event.js";
import {routSports} from "./Routes/sports.js";
import { routBonus} from "./Routes/bonuses.js";

import path from "path"
import { fileURLToPath } from "url"

const app = express()

app.disable("x-powered-by")

app.use(json())
app.use(cors({
    origin: "http://localhost:1234", // o donde esté tu frontend
    credentials: true
}));
app.use(cookieParser())

// Middleware para token
app.use((req, res, next) => {

    //console.log("Request antes del token: ", req)

    const token = req.cookies.access_token;
    req.session = { user: null };
    
    if (token) {
        try {
            const data = jwt.verify(token, SECRET_JWT_KEY);
            req.session.user = data;

            //console.log("Request despues del token: ", req)
        } catch (error) {
            console.error("Token inválido:", error.message);
        }
    }

    next();
});

app.get("/protected-route", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "No autorizado. Inicia sesión primero." });
    }

    res.status(200).json({ message: "Acceso permitido", user: req.session.user});
});

// Rutas API
app.use("/user", routUser)

//ruta de Apuestas
app.use("/bet", routBet)

//ruta de tarjetas
app.use("/transaction", routTransaction)

app.use("/event", routEvent)

app.use("/bonus", routBonus)
// Configurar __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use("/sports", routSports)
// Servir frontend desde /Fetch
app.use(express.static(path.join(__dirname, "../public")))

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"))
})

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`)
})
monitorBets();