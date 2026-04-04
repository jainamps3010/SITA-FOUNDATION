'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('vendors', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      name: { type: Sequelize.STRING(100), allowNull: false },
      email: { type: Sequelize.STRING(150), allowNull: false, unique: true },
      phone: { type: Sequelize.STRING(15), allowNull: false },
      company_name: { type: Sequelize.STRING(200), allowNull: false },
      gstin: { type: Sequelize.STRING(20), allowNull: true },
      category: {
        type: Sequelize.ENUM(
          'food_beverages', 'housekeeping', 'linen_laundry',
          'amenities', 'equipment', 'technology', 'furniture', 'other'
        ),
        allowNull: false
      },
      description: { type: Sequelize.TEXT, allowNull: true },
      address: { type: Sequelize.TEXT, allowNull: true },
      city: { type: Sequelize.STRING(100), allowNull: true },
      state: { type: Sequelize.STRING(100), allowNull: true },
      bank_account_number: { type: Sequelize.STRING(30), allowNull: true },
      bank_ifsc: { type: Sequelize.STRING(15), allowNull: true },
      bank_account_name: { type: Sequelize.STRING(100), allowNull: true },
      status: {
        type: Sequelize.ENUM('pending', 'active', 'suspended', 'rejected'),
        defaultValue: 'pending'
      },
      rejection_reason: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('vendors');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_vendors_category";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_vendors_status";');
  }
};
