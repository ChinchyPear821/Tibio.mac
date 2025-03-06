import { db } from "../Connection/db.js"

export class TransactionModel{
    //GET
    static async allBets({ data }){
        
    }

    //POST
    static async deposit({ data }){
        const {cardNumber, bank, amount, type} = data

        const uuid = "c1652e8c-d87a-11ef-83ea-047c162f14k5"
        console.log("Insertando deposito: ", uuid, cardNumber, amount)

        const insertDeposit = db.prepare(`
            INSERT INTO transactions
                (id_transaction, id_user, amount, card, bank, type, date, hour)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `)

        insertDeposit.run(uuid, , amount, cardNumber, bank, type, , ,);

        const transaction = db.prepare(`
            SELECT id_transaction, amount 
            FROM transactions
            WHERE id_transaction = ?
            `).get(uuid)

        console.log("Deposito Registrado")

        db.close()

        return transaction
    }
    static async withdraw({ data }){

    }

}