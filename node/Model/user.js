import { db } from "../Connection/db.js"
import bcrypt from "bcrypt"

export class UserModel{
    //POST
    static async register({ data }){
        try {
            const { username, email, password } = data;

            
            //const uuid = "c1652e8c-d87a-11ef-83ea-047c162f14c5"
            const uuid = crypto.randomUUID();
            //SALT ROUNDS = 3, para prueba
            const newPassword = await bcrypt.hash(password, 3);
    
            console.log("Insertando usuario:", uuid, username, email,newPassword);
    
            const insertUser = db.prepare(`
                INSERT INTO users (id_user, username, email, password )
                VALUES (?, ?, ?, ?)
            `);
    
            insertUser.run(uuid, username, email, newPassword);
    
            //Regresa un objeto= {id_user: 'c1652e8c-d87a-11ef-83ea-047c162f14c5',
            // username: 'Saul',email: 'saul_2004@gmail.com',balance: 0}
            const user = db.prepare(`SELECT id_user, username, email, balance FROM users WHERE id_user = ?`).get(uuid);

            console.log("Usuario insertado:", user);

            return user;
        } catch (error) {
            console.error("Error en register:", error);
            throw error
        }
    }
    static async login({ data }){
        const {email, password} = data;

        try{
            const searchUser = db.prepare(`
                SELECT * FROM users WHERE email = ?    
            `).get(email)

            //Si no existe el usuario regresa un objeto vacio
            if(!searchUser) return {}

            const { password: userPassWordHashed } = searchUser;

            const isValid = await bcrypt.compare(password, userPassWordHashed)
            
            if(!isValid) throw new Error("Password invalid")

            const {password:_, ...publicUser} = searchUser

            return publicUser

        } catch(error){
            console.error("Error en loggin", error)
            throw error
        }

    }
}