import { UserModel } from "../Model/user.js"

import { validateUsername } from "../Squema/userSquema.js"

export class UserController{
    static async register(req, res){
        try {
            const userValidated = validateUsername(req.body);
    
            if (userValidated.error) {
                return res.status(422).json({ error: userValidated.error.message });
            }
    
            const newUser = await UserModel.register({ data: userValidated.data });
    
            res.status(201).json(newUser);
        } catch (error) {
            console.error("Error en register:", error);
            res.status(500).json({ error: "Error en el servidor" });
        }
    }
    static async login(req, res){

    }
    static async logout(req, res){

    }
}