import { sequelize } from "../config/sequelize";
import { AccountModel, TransactionModel } from "../models";

interface CreateTransactionInput {
    accountId: string;
    type: "credit" | "debit";
    amount: number;
    description: string;
    reference_id: string;
}

export async function createTransaction(
    input: CreateTransactionInput,
) {
    const dbTransaction = await sequelize.transaction();

    try {
        const account = await AccountModel.findByPk(input.accountId, {
            transaction: dbTransaction,
            lock: dbTransaction.LOCK.UPDATE,
        });

        if (!account) {
            await dbTransaction.rollback();
            return { error: "ACCOUNT_NOT_FOUND" as const };
        }

        const existing = await TransactionModel.findOne({
            where: {
                account_id: input.accountId,
                reference_id: input.reference_id,
            },
            transaction: dbTransaction,
        });

        if (existing) {
            await dbTransaction.rollback();
            return { error: "DUPLICATE_TRANSACTION" as const };
        }

        const currentBalance = Number(account.balance);
        const amount = input.amount;

        if (input.type === "debit" && currentBalance < amount) {
            await dbTransaction.rollback();
            return { error: "INSUFFICIENT_BALANCE" as const };
        }

        const newBalance =
            input.type === "credit"
                ? currentBalance + amount
                : currentBalance - amount;

        account.balance = newBalance.toFixed(2);
        await account.save({ transaction: dbTransaction });

        const transaction = await TransactionModel.create(
            {
                account_id: account.id,
                type: input.type,
                amount: amount.toFixed(2),
                description: input.description,
                reference_id: input.reference_id,
            },
            { transaction: dbTransaction },
        );

        await dbTransaction.commit();

        return {
            transaction,
            balance: account.balance,
        };
    } catch (error) {
        try {
            await dbTransaction.rollback();
        } catch {
            // Transaction may already have been committed or rolled back.
        }

        throw error;
    }
}
