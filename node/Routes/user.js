import { Router } from "express"

import { UserController } from "../Controller/user.js"

export const routUser = Router()

//POST
routUser.post("/register", UserController.register)
routUser.post("/login", UserController.login)
routUser.post("/logout", UserController.logout)