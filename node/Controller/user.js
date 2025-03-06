import { UserModel } from "../Model/user.js"

import { validateUsername } from "../Schema/userSchema.js"

export class UserController{
    //POST
    static async register(req, res){
        try {
            const userValidated = validateUsername(req.body);
    
            if (userValidated.error) {
                return res.status(422).json({ error: userValidated.error.message });
            }
            
            //Me regresa el usuario creado
            const newUser = await UserModel.register({ data: userValidated.data });
    
            res.status(201).json(newUser);
        } catch (error) {
            console.error("Error en register:", error);
            res.status(500).json({ error: "Error al registrar" });
        }
    }
    static async login(req, res){

    }
    static async logout(req, res){

    }
}