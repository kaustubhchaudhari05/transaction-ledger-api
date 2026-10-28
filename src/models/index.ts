import { sequelize } from "../config/sequelize";
import { initAccountModel } from "./account";
import { initTransactionModel } from "./transaction";

export const AccountModel = initAccountModel(sequelize);
export const TransactionModel = initTransactionModel(sequelize);

TransactionModel.belongsTo(AccountModel, {
  foreignKey: "account_id",
  onDelete: "RESTRICT",
});

AccountModel.hasMany(TransactionModel, {
  foreignKey: "account_id",
});