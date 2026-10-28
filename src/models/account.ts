import {
  DataTypes,
  Model,
  Optional,
  Sequelize,
} from "sequelize";

interface AccountAttributes {
  id: number;
  name: string;
  balance: string;
  created_at?: Date;
}

type AccountCreationAttributes = Optional<
  AccountAttributes,
  "id" | "balance" | "created_at"
>;

export class Account extends Model<
  AccountAttributes,
  AccountCreationAttributes
> implements AccountAttributes {
  declare id: number;
  declare name: string;
  declare balance: string;
  declare created_at: Date;
}

export function initAccountModel(sequelize: Sequelize) {
  Account.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      balance: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: "accounts",
      timestamps: false,
      underscored: true,
    },
  );

  return Account;
}