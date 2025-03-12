import { Router } from "express";

import { TransactionController } from "../Controller/transaction.js";

export const routTransaction = Router()

//DEBERIA DE PASAR EL USER ID CON UN JWT

//GET
routTransaction.get("/user/:id", TransactionController.allTransactions) //todas las transacciones 

//POST
routTransaction.post("/deposit/:id", TransactionController.deposit)
routTransaction.post("/withdraw/:id", TransactionController.withdraw)
