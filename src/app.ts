import express from "express";
import dotenv from "dotenv";
import { pool } from "./config/database";
import accountRoutes from "./routes/account.routes";
import transactionRoutes from "./routes/transaction.routes";
import balanceRoutes from "./routes/balance.routes";
import transactionHistoryRoutes from "./routes/transaction-history.routes";

dotenv.config();

const app = express();

app.use(express.json());
app.use("/accounts", accountRoutes);
app.use("/accounts", transactionRoutes);
app.use("/accounts", balanceRoutes);
app.use("/accounts", transactionHistoryRoutes);

app.use(
    (
        error: any,
        _req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) => {
        if (error instanceof SyntaxError && "body" in error) {
            return res.status(400).json({
                error: "INVALID_JSON",
                message: "Request body contains invalid JSON.",
            });
        }

        next(error);
    },
);

app.get("/health", async (_req, res) => {
    try {
        await pool.query("SELECT 1");

        res.status(200).json({
            status: "ok",
            database: "connected",
        });
    } catch {
        res.status(500).json({
            status: "error",
            message: "Database connection failed",
        });
    }
});

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
