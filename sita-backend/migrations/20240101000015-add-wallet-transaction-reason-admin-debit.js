'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_sita_wallet_transactions_reason"
        ADD VALUE IF NOT EXISTS 'admin_debit';
    `);
  },
  down: async () => {
    // PostgreSQL does not support removing enum values without recreating the type.
  }
};
