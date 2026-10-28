import { Router } from "express";
import { addTransaction } from "../controllers/transaction.controller";

const router = Router();

router.post("/:id/transactions", addTransaction);

export default router;
