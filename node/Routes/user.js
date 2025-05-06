import { Router } from "express"

import { UserController } from "../Controller/user.js"

export const routUser = Router()

//GET
routUser.get("/protected", UserController.protected)
routUser.get("/cards", UserController.allCardsByUser)

//POST
routUser.post("/register", UserController.register)
routUser.post("/login", UserController.login)
routUser.post("/logout", UserController.logout)
routUser.post("/card", UserController.addCard)

//PUT
routUser.put("/updateRole", UserController.updateUserRole);