'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // ── Add new ENUM values to the existing category type ───────────────────────
    // ALTER TYPE ... ADD VALUE cannot run inside a transaction in PostgreSQL,
    // so we issue each statement individually without wrapping in a transaction.
    const newCategories = ['oils', 'grains', 'spices', 'gas', 'cleaning_supplies'];
    for (const val of newCategories) {
      await queryInterface.sequelize.query(
        `ALTER TYPE "enum_products_category" ADD VALUE IF NOT EXISTS '${val}'`,
        { raw: true }
      );
    }

    // ── Add market_price column ─────────────────────────────────────────────────
    await queryInterface.addColumn('products', 'market_price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null,
    });

    // ── Add stock_quantity column ───────────────────────────────────────────────
    await queryInterface.addColumn('products', 'stock_quantity', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('products', 'market_price');
    await queryInterface.removeColumn('products', 'stock_quantity');
    // Note: PostgreSQL does not support removing values from an ENUM type.
    // The added ENUM values (oils, grains, spices, gas, cleaning_supplies)
    // must be removed manually if a full rollback is needed.
  }
};
