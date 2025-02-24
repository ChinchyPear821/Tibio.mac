import { db } from "../Connection/db.js"
import bcrypt from "bcrypt"
import crypto from "crypto"


export class UserModel{
    static async register({ data }){
        try {
            const { username, password } = data;

            const uuid = "c1652e8c-d87a-11ef-83ea-047c162f14c5"
            const newPassword = await bcrypt.hash(password, 10);
    
            console.log("Insertando usuario:", uuid, username, newPassword);
    
            const insertUser = db.prepare(`
                INSERT INTO users (user_id, username, password)
                VALUES (?, ?, ?)
            `);
    
            insertUser.run(uuid, username, newPassword);
    
            const user = db.prepare(`SELECT * FROM users WHERE user_id = ?`).get(uuid);
            
            console.log("Usuario insertado:", user);

            db.close()
            return user;
        } catch (error) {
            console.error("Error en register:", error);
            throw error;
        }
    }
    static async login(){

    }
    static async logout(){

    }
}