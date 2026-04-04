'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('master_contracts', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      vendor_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'vendors', key: 'id' }, onDelete: 'CASCADE'
      },
      member_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'members', key: 'id' }, onDelete: 'CASCADE'
      },
      product_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'products', key: 'id' }, onDelete: 'CASCADE'
      },
      negotiated_price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      valid_from: { type: Sequelize.DATEONLY, allowNull: false },
      valid_to: { type: Sequelize.DATEONLY, allowNull: false },
      status: {
        type: Sequelize.ENUM('active', 'expired', 'cancelled'),
        defaultValue: 'active'
      },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('master_contracts');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_master_contracts_status";');
  }
};
