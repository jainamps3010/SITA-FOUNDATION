'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('disputes', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      order_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'orders', key: 'id' }, onDelete: 'CASCADE'
      },
      member_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'members', key: 'id' }, onDelete: 'CASCADE'
      },
      vendor_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'vendors', key: 'id' }, onDelete: 'CASCADE'
      },
      reason: {
        type: Sequelize.ENUM(
          'wrong_item', 'damaged_item', 'short_quantity',
          'non_delivery', 'quality_issue', 'overcharged', 'other'
        ),
        allowNull: false
      },
      description: { type: Sequelize.TEXT, allowNull: false },
      status: {
        type: Sequelize.ENUM('open', 'investigating', 'resolved', 'rejected'),
        defaultValue: 'open'
      },
      resolution: { type: Sequelize.TEXT, allowNull: true },
      refund_amount: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
      refund_to_wallet: { type: Sequelize.BOOLEAN, defaultValue: false },
      resolved_at: { type: Sequelize.DATE, allowNull: true },
      resolved_by: { type: Sequelize.UUID, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });
    await queryInterface.addIndex('disputes', ['order_id']);
    await queryInterface.addIndex('disputes', ['member_id']);
    await queryInterface.addIndex('disputes', ['status']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('disputes');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_disputes_reason";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_disputes_status";');
  }
};
