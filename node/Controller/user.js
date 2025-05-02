import jwt from 'jsonwebtoken'
import { UserModel } from "../Model/user.js"

import { validateUsername, partialValidateUsername } from "../Schema/userSchema.js"
import { validateCard } from '../Schema/cardSchema.js'

import { SECRET_JWT_KEY } from "../config.js"

export class UserController{
    //GET
    static async protected(req, res){
        try{
            const { user: { id_user } } = req.session

            const userInfo = await UserModel.protected({ data: { id_user } })

            return res.status(201).json(userInfo)
        }catch(e){
            console.error("Error al regresar la informacion dle usuario:", error)
            res.status(500).json({ error: "Error al regresar la informacion del usuario "})
        }
    }
    static async allCardsByUser(req, res){
        try{
            const { user: { id_user } } = req.session

            const cards =  await UserModel.allCardsByUser({ data: { id_user }})

            res.status(201).json(cards)

        }catch(e){
            console.error("Error controller allCardsByUser", e)
            return res.status(500).json( { error: "Error controller allCardsByUser" } )
        }
    }


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
        try{
            const userValidated = partialValidateUsername(req.body)

            if(userValidated.error){
                return res.status(422).json({ error: userValidated.error.message })
            }

            //Me regresa el usuario encontrado
            const userLogged = await UserModel.login({ data: userValidated.data })

            const { id_user, username, rol } = userLogged

            //crear la cookie
            const token = jwt.sign(
                { id_user, username, rol },
                SECRET_JWT_KEY,
                { expiresIn: "1h" }
            )
            
            //mandar la cookie con la respuesta
            res
            .cookie("access_token", token, {
                httpOnly: true, //solo servidor
                sameSite: "strict", //la cookie solo viaja en nuestro dominio
                maxAge: 1000*60*60 //1hr de expiracion
            })
            .status(201).json({ userLogged, token })

        } catch(error){
            console.error("Error al hacer login:", error)
            res.status(500).json({ error: "Error al hacer login "})
        }

    }
    static async logout(req, res){
        res
        .clearCookie("access_token")
        .status(201)
        .json({ message: "Logout succesful" })
    }
    static async addCard(req, res){
        try{
            const { user: { id_user } } = req.session
            console.log(req.body)
            const cardInfo = { id_user, ...req.body }

            const cardValidated =  validateCard(cardInfo)

            if(cardValidated.error) return res.status(422).json({ error:  cardValidated.error })

            const card = await UserModel.addCard({ data:  cardValidated.data })

            res.status(201).json(card)

        }catch(e){
            console.error("Error addCard controller", e)
            return res.status(500).json({ error: "Error addCard controller" })
        }
    }
} 