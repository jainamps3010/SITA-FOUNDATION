'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('orders', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      order_number: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      member_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'members', key: 'id' }, onDelete: 'RESTRICT'
      },
      vendor_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'vendors', key: 'id' }, onDelete: 'RESTRICT'
      },
      status: {
        type: Sequelize.ENUM(
          'pending', 'confirmed', 'dispatched', 'delivered', 'cancelled', 'disputed'
        ),
        defaultValue: 'pending'
      },
      total_amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      sita_commission: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      vendor_amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      payment_method: {
        type: Sequelize.ENUM('wallet', 'bank_transfer', 'upi', 'cash'),
        defaultValue: 'bank_transfer'
      },
      payment_status: {
        type: Sequelize.ENUM('pending', 'paid', 'refunded'),
        defaultValue: 'pending'
      },
      delivery_otp: { type: Sequelize.STRING(6), allowNull: true },
      delivery_otp_verified: { type: Sequelize.BOOLEAN, defaultValue: false },
      delivery_address: { type: Sequelize.TEXT, allowNull: true },
      expected_delivery_date: { type: Sequelize.DATEONLY, allowNull: true },
      delivered_at: { type: Sequelize.DATE, allowNull: true },
      cancelled_at: { type: Sequelize.DATE, allowNull: true },
      cancellation_reason: { type: Sequelize.TEXT, allowNull: true },
      wallet_amount_used: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });
    await queryInterface.addIndex('orders', ['member_id']);
    await queryInterface.addIndex('orders', ['vendor_id']);
    await queryInterface.addIndex('orders', ['status']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('orders');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_orders_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_orders_payment_method";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_orders_payment_status";');
  }
};
