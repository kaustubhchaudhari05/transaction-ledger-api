import { Request, Response } from "express";
import { Op } from "sequelize";
import { TransactionModel } from "../models";

export async function getTransactionHistory(
  req: Request,
  res: Response,
) {
  const accountId = String(req.params.id);
  const type = req.query.type;
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);

  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "Page must be positive and limit must be between 1 and 100.",
    });
  }

  if (
    type !== undefined &&
    type !== "credit" &&
    type !== "debit"
  ) {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "Type must be credit or debit.",
    });
  }

  try {
    const where: {
      account_id: string;
      type?: "credit" | "debit";
    } = { account_id: accountId };

    if (type === "credit" || type === "debit") {
      where.type = type;
    }

    const { count, rows } = await TransactionModel.findAndCountAll({
      where,
      order: [["created_at", "DESC"], ["id", "DESC"]],
      limit,
      offset: (page - 1) * limit,
    });

    return res.status(200).json({
      account_id: accountId,
      transactions: rows,
      pagination: {
        current_page: page,
        page_size: limit,
        total_records: count,
        total_pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Get transaction history error:", error);

    return res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to retrieve transaction history.",
    });
  }
}
