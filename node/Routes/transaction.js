import { Router } from "express";

import { TransactionController } from "../Controller/transaction.js";

export const routTransaction = Router()

//DEBERIA DE PASAR EL USER ID CON UN JWT

//GET
routTransaction.get("/user", TransactionController.allTransactions) //todas las transacciones 

//POST
routTransaction.post("/deposit", TransactionController.deposit)
routTransaction.post("/withdraw", TransactionController.withdraw)
