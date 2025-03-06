import { Router } from "express";

import { TransactionController } from "../Controller/transaction";

export const routTransaction = Router()

//GET
routTransaction.get("/user/:id", TransactionController.allTransactions) //todas las transacciones 

//POST
routTransaction.post("/deposit", TransactionController.deposit)
routTransaction.post("/withdraw", TransactionController.withdraw)
