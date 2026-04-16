'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const t = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn('members', 'membership_start_date', {
        type: Sequelize.DATEONLY,
        allowNull: true
      }, { transaction: t });

      await queryInterface.addColumn('members', 'membership_expiry_date', {
        type: Sequelize.DATEONLY,
        allowNull: true
      }, { transaction: t });

      await queryInterface.addColumn('members', 'membership_status', {
        type: Sequelize.ENUM('active', 'expired', 'cancelled', 'pending'),
        allowNull: false,
        defaultValue: 'pending'
      }, { transaction: t });

      // Backfill: set status + dates for existing paid members
      await queryInterface.sequelize.query(`
        UPDATE members
        SET
          membership_status = 'active',
          membership_start_date = COALESCE(membership_paid_at::date, CURRENT_DATE),
          membership_expiry_date = COALESCE(membership_paid_at::date, CURRENT_DATE) + INTERVAL '1 year'
        WHERE membership_paid = true AND (membership_active IS NULL OR membership_active = true)
      `, { transaction: t });

      await t.commit();
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('members', 'membership_start_date');
    await queryInterface.removeColumn('members', 'membership_expiry_date');
    await queryInterface.removeColumn('members', 'membership_status');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_members_membership_status";');
  }
};
