import { TransactionModel } from "../Model/transaction.js"

import { validateTransaction, partialValidateTransaction } from "../Schema/transactionSchema.js"

/*
los datos del get desde req.params(url)
los datos del post desde req.body
los datos del get desde req.query comom "?id=12343"
*/

export class TransactionController{
    //GET
    static async allTransactions(req, res){
        try{
            console.log(req.params)
            const { id: id_user} = req.params

            //me regresa un array de todas las transacciones
            const transactions = await TransactionModel.allTransactions({ data: { id_user } })

            res.status(201).json(transactions);

        }catch(error){
            console.error("Error al buscar historial de transacciones", error)
            res.status(500).json({ error: "Error al histotial de Transacciones" })
        }
    }

    //POST
    static async deposit(req, res){
        try{
            //id_user con JWT
            const {id: id_user} = req.params
            const transactionInfo = {id_user, ...req.body}
            const depositValidated = validateTransaction(transactionInfo)

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
            //id_user con JWT
            const {id: id_user} = req.params
            const transactionInfo = {id_user, ...req.body}
            const withdrawValidated = partialValidateTransaction(transactionInfo)

            console.log(transactionInfo)

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