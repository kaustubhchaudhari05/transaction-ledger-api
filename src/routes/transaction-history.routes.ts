import { Router } from "express";
import { getTransactionHistory } from "../controllers/transaction-history.controller";

const router = Router();

router.get("/:id/transactions", getTransactionHistory);

export default router;
