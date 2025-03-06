import { TransactionModel } from "../Model/transaction.js"

import { validateTransaction } from "../Schema/transactionSchema.js"

/*
los datos del get desde req.query(url)
los datos del post desde req.body
*/

export class TransactionController{
    //GET
    static async allTransactions(req, res){
        try{
            const { id: user_id} = req.query

            //me regresa un array de todas las transacciones
            const transactions = await TransactionModel.allBets({ data: user_id })

            res.status(201).json(transactions);

        }catch(error){
            console.error("Error al buscar historial de transacciones", error)
            res.status(500).json({ error: "Error al histotial de Transacciones" })
        }
    }

    //POST
    static async deposit(req, res){
        try{

            const depositValidated = validateTransaction(req.body)

            if(depositValidated.error){
                return res.status(422).json({ error: depositValidated.error.message })
            }

            //me regresa el id de la transaccion y el monto
            const transaction = await TransactionModel.deposit({ data:  depositValidated.data })

            res.status(201).json(transaction)
            
        }catch(error){
            console.error("Error en deposito", error)
            res.status(500).json({ error: "Error al depositar" })
        }
    }
    static async withdraw(req, res){
        try{
            const withdrawValidated = validateTransaction(req.body)

            if(withdrawValidated.error){
                return res.status(422).json({ error: withdrawValidated.error.message })
            }

            //me regresa el id de la transaccion y el monto
            const transaction = await TransactionModel.withdraw({ data: withdrawValidated.data })

            res.status(201).json(transaction)

        }catch(error){
            console.error("Error al retirar", error)
            res.status(500).json({ error: "Error al retirar" })
        }
    }
}