'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('members', 'utr_number', {
      type: Sequelize.STRING(50),
      allowNull: true
    });
    await queryInterface.addColumn('members', 'payment_submitted_at', {
      type: Sequelize.DATE,
      allowNull: true
    });
    await queryInterface.addColumn('members', 'payment_verified_by', {
      type: Sequelize.UUID,
      allowNull: true
    });
    await queryInterface.addColumn('members', 'payment_verified_at', {
      type: Sequelize.DATE,
      allowNull: true
    });
    await queryInterface.addColumn('members', 'payment_status', {
      type: Sequelize.ENUM('not_paid', 'pending_verification', 'verified', 'rejected'),
      defaultValue: 'not_paid',
      allowNull: false
    });
    await queryInterface.addColumn('members', 'payment_rejection_reason', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('members', 'utr_number');
    await queryInterface.removeColumn('members', 'payment_submitted_at');
    await queryInterface.removeColumn('members', 'payment_verified_by');
    await queryInterface.removeColumn('members', 'payment_verified_at');
    await queryInterface.removeColumn('members', 'payment_rejection_reason');
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_members_payment_status;");
    await queryInterface.removeColumn('members', 'payment_status');
  }
};
