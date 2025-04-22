import { db } from "../Connection/db.js"
import bcrypt from "bcrypt"
import crypto from "crypto" // asegúrate de importar esto si usas uuid

export class UserModel {
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
    
}
