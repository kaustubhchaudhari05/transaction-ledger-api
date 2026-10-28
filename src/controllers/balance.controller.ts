import { Request, Response } from "express";
import { AccountModel } from "../models";

export async function getAccountBalance(req: Request, res: Response) {
  const accountId = String(req.params.id);

  try {
    const account = await AccountModel.findByPk(accountId);

    if (!account) {
      return res.status(404).json({
        error: "ACCOUNT_NOT_FOUND",
        message: "Account not found.",
      });
    }

    return res.status(200).json({
      account_id: account.id,
      balance: account.balance,
    });
  } catch (error) {
    console.error("Get account balance error:", error);

    return res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to retrieve account balance.",
    });
  }
}
