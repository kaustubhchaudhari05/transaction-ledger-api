import { Request, Response } from "express";
import { AccountModel } from "../models";

export async function createAccount(req: Request, res: Response) {
  try {
    const { name } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Account name is required.",
      });
    }

    const account = await AccountModel.create({
      name: name.trim(),
    });

    return res.status(201).json({
      id: account.id,
      name: account.name,
      balance: account.balance,
      created_at: account.created_at,
    });
  } catch (error) {
    console.error("Create account error:", error);

    return res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to create account.",
    });
  }
}
