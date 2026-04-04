'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('members', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      name: { type: Sequelize.STRING(100), allowNull: false },
      email: { type: Sequelize.STRING(150), allowNull: true },
      phone: { type: Sequelize.STRING(15), allowNull: false, unique: true },
      hotel_name: { type: Sequelize.STRING(200), allowNull: false },
      hotel_address: { type: Sequelize.TEXT, allowNull: true },
      city: { type: Sequelize.STRING(100), allowNull: true },
      state: { type: Sequelize.STRING(100), allowNull: true },
      pincode: { type: Sequelize.STRING(10), allowNull: true },
      gstin: { type: Sequelize.STRING(20), allowNull: true },
      status: {
        type: Sequelize.ENUM('pending', 'active', 'suspended', 'rejected'),
        defaultValue: 'pending'
      },
      membership_paid: { type: Sequelize.BOOLEAN, defaultValue: false },
      membership_fee: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      membership_paid_at: { type: Sequelize.DATE, allowNull: true },
      sita_wallet_balance: { type: Sequelize.DECIMAL(12, 2), defaultValue: 0 },
      otp: { type: Sequelize.STRING(6), allowNull: true },
      otp_expires_at: { type: Sequelize.DATE, allowNull: true },
      rejection_reason: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('members');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_members_status";');
  }
};
