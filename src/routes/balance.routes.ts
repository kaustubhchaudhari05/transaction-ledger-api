    import { Router } from "express";
import { getAccountBalance } from "../controllers/balance.controller";

const router = Router();

router.get("/:id/balance", getAccountBalance);

export default router;
