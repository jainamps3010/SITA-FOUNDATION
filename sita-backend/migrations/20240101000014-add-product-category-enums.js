'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_products_category"
        ADD VALUE IF NOT EXISTS 'oils';
      ALTER TYPE "enum_products_category"
        ADD VALUE IF NOT EXISTS 'grains';
      ALTER TYPE "enum_products_category"
        ADD VALUE IF NOT EXISTS 'spices';
      ALTER TYPE "enum_products_category"
        ADD VALUE IF NOT EXISTS 'gas';
      ALTER TYPE "enum_products_category"
        ADD VALUE IF NOT EXISTS 'cleaning_supplies';
    `);
  },

  down: async () => {
    // PostgreSQL does not support removing enum values without recreating the type.
    // To roll back, drop and recreate the type manually if needed.
  }
};
