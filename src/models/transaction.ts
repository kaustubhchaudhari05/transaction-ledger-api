import {
  DataTypes,
  Model,
  Optional,
  Sequelize,
} from "sequelize";

interface TransactionAttributes {
  id: number;
  account_id: number;
  type: "credit" | "debit";
  amount: string;
  description: string;
  reference_id: string;
  created_at?: Date;
}

type TransactionCreationAttributes = Optional<
  TransactionAttributes,
  "id" | "created_at"
>;

export class Transaction extends Model<
  TransactionAttributes,
  TransactionCreationAttributes
> implements TransactionAttributes {
  declare id: number;
  declare account_id: number;
  declare type: "credit" | "debit";
  declare amount: string;
  declare description: string;
  declare reference_id: string;
  declare created_at: Date;
}

export function initTransactionModel(sequelize: Sequelize) {
  Transaction.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      account_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("credit", "debit"),
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
          min: 0.01,
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      reference_id: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: "transactions",
      timestamps: false,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["account_id", "reference_id"],
          name: "transactions_reference_unique",
        },
      ],
    },
  );

  return Transaction;
}