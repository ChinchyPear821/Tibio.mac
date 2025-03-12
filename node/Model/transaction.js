import { db } from "../Connection/db.js"

export class TransactionModel{
    //GET
    static async allTransactions({ data }){
        try{
            const { id_user } = data

            const allTransactions = db.prepare(`
                SELECT * FROM transactions WHERE id_user = ?
            `).all(id_user)

            return allTransactions

        }catch(error){
            console.error("Error al regresar todas las transacciones", error)
            throw error
        }
    }

    //POST
    static async deposit({ data }){
        try{
            const {id_user, cardNumber, bank, amount, type} = data

            //Crear el registro en la tabla transactions
            //const uuid = "c1652e8c-d87a-11ef-83ea-047c162f14k5"
            const uuid = crypto.randomUUID()
            console.log("Insertando deposito: ", uuid, cardNumber, amount)

            const insertDeposit = db.prepare(`
                INSERT INTO transactions
                    (id_transaction, id_user, amount, card, bank, type, date, hour)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `)

            const now = new Date()
            const date = now.toLocaleDateString()
            const hour = now.toLocaleTimeString()

            insertDeposit.run(uuid, id_user, amount, cardNumber, bank, type, date, hour);

            const transaction = db.prepare(`
                SELECT id_transaction, amount 
                FROM transactions
                WHERE id_transaction = ?
                `).get(uuid)

            console.log("Deposito Registrado")

            //Actualizar el balance del usuario
            const user = db.prepare(`
                SELECT balance FROM users WHERE id_user = ?
            `).get(id_user)
            
            const { balance } = user
            
            const newBalance = balance + amount;
            
            const userBalance = db.prepare(`
                UPDATE users SET balance = ? WHERE id_user = ?    
                `)
                
            const userBalanceUpdated = userBalance.run(newBalance, id_user)
            
            console.log("Balance del usuario modificado(DEPOSITO)", userBalanceUpdated)

            return transaction

        } catch(error){
            console.error("Error al depositar", error)
            throw error
        }
    }
    static async withdraw({ data }){
        try{
            const {id_user, cardNumber, bank, amount, type} = data
            
            //Se valida el saldo antes de hacer todo lo demas
            const user = db.prepare(`
                SELECT balance FROM users WHERE id_user = ?    
            `).get(id_user)

            const { balance } = user

            if(balance < amount) throw new Error("Error al retirar. Retiro mayor que el saldo")

            //Crear el registro en la tabla transactions
            //const uuid = "c1652e8c-d87a-11ef-83ea-047c162w14w5"
            const uuid = crypto.randomUUID()
            console.log("Insertando retiro: ", uuid, cardNumber, amount)

            const insertWithDraw = db.prepare(`
                INSERT INTO transactions
                    (id_transaction, id_user, amount, card, bank, type, date, hour)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `)

            const now = new Date()
            const date = now.toLocaleDateString()
            const hour = now.toLocaleTimeString()

            insertWithDraw.run(uuid, id_user, amount, cardNumber, bank, type, date, hour);

            const transaction = db.prepare(`
                SELECT id_transaction, amount 
                FROM transactions
                WHERE id_transaction = ?
                `).get(uuid)

            console.log("Retiro Registrado", transaction)

            //Actualizar el balance del usuario
            const newBalance = balance - amount;

            const userBalance = db.prepare(`
                UPDATE users SET balance = ? WHERE id_user = ?     
            `)
            
            const userBalanceUpdated = userBalance.run(newBalance, id_user)

            console.log(userBalanceUpdated)

            const selectUserBalanceUpdated = db.prepare(`
                SELECT id_user, balance FROM users WHERE id_user = ?    
            `).get(id_user)

            return selectUserBalanceUpdated

        }catch(error){
            console.error("Error al retirar", error)
            throw error
        }
    }

}