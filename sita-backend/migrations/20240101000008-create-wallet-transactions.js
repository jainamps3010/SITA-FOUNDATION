'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('sita_wallet_transactions', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      member_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'members', key: 'id' }, onDelete: 'CASCADE'
      },
      type: { type: Sequelize.ENUM('credit', 'debit'), allowNull: false },
      amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      balance_after: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      reason: {
        type: Sequelize.ENUM(
          'order_refund', 'dispute_resolution', 'admin_credit',
          'order_payment', 'membership_refund'
        ),
        allowNull: false
      },
      description: { type: Sequelize.TEXT, allowNull: true },
      order_id: {
        type: Sequelize.UUID, allowNull: true,
        references: { model: 'orders', key: 'id' }, onDelete: 'SET NULL'
      },
      reference_id: { type: Sequelize.STRING(100), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });
    await queryInterface.addIndex('sita_wallet_transactions', ['member_id']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('sita_wallet_transactions');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_sita_wallet_transactions_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_sita_wallet_transactions_reason";');
  }
};
