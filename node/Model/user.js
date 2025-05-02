import { db } from "../Connection/db.js"
import { getRowById } from "../utils.js"
import bcrypt from "bcrypt"
import crypto from "crypto" // asegúrate de importar esto si usas uuid

export class UserModel {
    //GET
    static async protected({ data }){
        try{
            const { id_user } = data

            const usertInfo =  db.prepare(`
                SELECT username, balance, email 
                FROM users     
                WHERE id_user= ?
            `).get(id_user)

            return usertInfo

        }catch(error){
            console.error("Error al regresar la informacion dle usuario")
            throw error
        }
    }

    static async allCardsByUser({ data }){
        try{
            const { id_user } = data

            return getRowById("cards", "id_user", id_user)

        } catch(e){
            console.error("Error al allCardsByUser Model", e)
            throw new Error("Error al allCardsByUser Model", e)
        }

    }
    //POST
    static async register({ data }) {
        try {
            const { username, email, password } = data;

            const existingUser = db.prepare(`
                SELECT * FROM users WHERE email = ? OR username = ?
            `).get(email, username);

            if (existingUser) {
                throw new Error("El correo electrónico o el nombre de usuario ya están registrados");
            }

            const uuid = crypto.randomUUID();
            const hashedPassword = await bcrypt.hash(password, 10);

            const insertUser = db.prepare(`
                INSERT INTO users (id_user, username, email, password)
                VALUES (?, ?, ?, ?)
            `);

            insertUser.run(uuid, username, email, hashedPassword);

            const user = db.prepare(`
                SELECT id_user, username, email, balance FROM users WHERE id_user = ?
            `).get(uuid);

            return user;
        } catch (error) {
            console.error("Error en register:", error);
            throw error;
        }
    }

    static async login({ data }) {
        const { email, password } = data;
    
        try {
            const searchUser = db.prepare(`
                SELECT * FROM users WHERE email = ?
            `).get(email);  // <-- .get debería devolver undefined si no lo encuentra
            console.log("Resultado de búsqueda:", searchUser);

            if (!searchUser) {
                throw new Error("Usuario no encontrado"); // <--- Aquí debería lanzar error
            }
    
            const { password: userPasswordHashed } = searchUser;
    
            const isValid = await bcrypt.compare(password, userPasswordHashed);
            if (!isValid) {
                throw new Error("Contraseña incorrecta");
            }
    
            const { password: _, ...publicUser } = searchUser;
            return publicUser;
    
        } catch (error) {
            console.error("Error en login:", error);
            throw error;
        }
    }

    static async addCard({ data }){
        try{
            const { id_user, cardName, cardNumber, cardExpiration, cardPassword, bank } = data

            const uuid = crypto.randomUUID()
            console.log("Insertando tarjeta", uuid, id_user, cardName, cardNumber, cardExpiration, cardPassword, bank)

            const insertCard = db.prepare(`
                INSERT INTO cards
                    (id_card, id_user, name, number, expiration, cvv, bank)    
                VALUES
                    (?, ?, ?, ?, ?, ?, ?)
            `)

            insertCard.run(uuid, id_user, cardName, cardNumber, cardExpiration, cardPassword, bank)

            return getRowById("cards", "id_card", uuid)

        }catch(e){
            console.error("Error addCard model", e)
            throw new Error("Erroe addCard mode", e)
        }
    }
}