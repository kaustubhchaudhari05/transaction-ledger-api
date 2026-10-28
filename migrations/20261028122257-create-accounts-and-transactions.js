"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("accounts", {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      balance: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.createTable("transactions", {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      account_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "accounts",
          key: "id",
        },
        onDelete: "RESTRICT",
      },
      type: {
        type: Sequelize.ENUM("credit", "debit"),
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      reference_id: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addConstraint("transactions", {
      fields: ["account_id", "reference_id"],
      type: "unique",
      name: "transactions_reference_unique",
    });

    await queryInterface.addIndex(
      "transactions",
      ["account_id", "created_at"],
      { name: "idx_transactions_account_created" },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("transactions");
    await queryInterface.dropTable("accounts");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_transactions_type";',
    );
  },
};
