import express, { json } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import jwt from "jsonwebtoken"
import { PORT, SECRET_JWT_KEY } from "./config.js"

import { routUser } from "./Routes/user.js"
import { routBet } from "./Routes/bet.js"
import { routTransaction } from "./Routes/transaction.js"

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
    const token = req.cookies.access_token;
    req.session = { user: null };

    if (token) {
        try {
            const data = jwt.verify(token, SECRET_JWT_KEY);
            req.session.user = data;
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
app.use("/bet", routBet)
app.use("/transaction", routTransaction)

// Configurar __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Servir frontend desde /Fetch
app.use(express.static(path.join(__dirname, "../public")))

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"))
})

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en: http://localhost:${PORT}`)
})
