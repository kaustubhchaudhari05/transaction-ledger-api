import { Request, Response } from "express";
import { createTransaction } from "../services/transaction.service";

export async function addTransaction(req: Request, res: Response) {
    const accountId = String(req.params.id);
    const { type, amount, description, reference_id } = req.body;

    if (type !== "credit" && type !== "debit") {
        return res.status(400).json({
            error: "VALIDATION_ERROR",
            message: "Type must be credit or debit.",
        });
    }

    if (
        typeof amount !== "number" ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        !Number.isInteger(amount * 100)
    ) {
        return res.status(400).json({
            error: "VALIDATION_ERROR",
            message: "Amount must be a positive number with at most 2 decimal places.",
        });
    }

    if (typeof description !== "string" || !description.trim()) {
        return res.status(400).json({
            error: "VALIDATION_ERROR",
            message: "Description is required.",
        });
    }

    if (
        typeof reference_id !== "string" ||
        !reference_id.trim()
    ) {
        return res.status(400).json({
            error: "VALIDATION_ERROR",
            message: "reference_id is required.",
        });
    }

    try {
        if (!/^[1-9]\d*$/.test(accountId)) {
            return res.status(400).json({
                error: "VALIDATION_ERROR",
                message: "Account ID must be a positive integer.",
            });
        }
        if (description.trim().length > 5000) {
            return res.status(400).json({
                error: "VALIDATION_ERROR",
                message: "Description must not exceed 5000 characters.",
            });
        }

        if (reference_id.trim().length > 100) {
            return res.status(400).json({
                error: "VALIDATION_ERROR",
                message: "reference_id must not exceed 100 characters.",
            });
        }
        const result = await createTransaction({
            accountId,
            type,
            amount,
            description: description.trim(),
            reference_id: reference_id.trim(),
        });

        if ("error" in result && result.error) {
            switch (result.error) {
                case "ACCOUNT_NOT_FOUND":
                    return res.status(404).json({
                        error: result.error,
                        message: "Account not found.",
                    });

                case "DUPLICATE_TRANSACTION":
                    return res.status(409).json({
                        error: result.error,
                        message: "Transaction reference already exists for this account.",
                    });

                case "INSUFFICIENT_BALANCE":
                    return res.status(400).json({
                        error: result.error,
                        message: "Insufficient balance.",
                    });
            }
        }

        return res.status(201).json({
            message: "Transaction created successfully.",
            transaction: result.transaction,
            balance: result.balance,
        });
    } catch (error) {
        console.error("Add transaction error:", error);

        return res.status(500).json({
            error: "INTERNAL_SERVER_ERROR",
            message: "Failed to create transaction.",
        });
    }
}
