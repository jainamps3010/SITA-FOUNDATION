'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add type column
    await queryInterface.addColumn('disputes', 'type', {
      type: Sequelize.ENUM('dispute', 'feedback'),
      defaultValue: 'dispute',
      allowNull: false,
      after: 'id',
    });

    // Make order_id nullable
    await queryInterface.changeColumn('disputes', 'order_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });

    // Make vendor_id nullable
    await queryInterface.changeColumn('disputes', 'vendor_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });

    // Make reason nullable
    await queryInterface.changeColumn('disputes', 'reason', {
      type: Sequelize.ENUM(
        'wrong_item', 'damaged_item', 'short_quantity',
        'non_delivery', 'quality_issue', 'overcharged', 'other'
      ),
      allowNull: true,
    });

    // Add category column
    await queryInterface.addColumn('disputes', 'category', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'reason',
    });

    // Add rating column
    await queryInterface.addColumn('disputes', 'rating', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'category',
    });

    // Add 'reviewed' to status enum
    await queryInterface.changeColumn('disputes', 'status', {
      type: Sequelize.ENUM('open', 'investigating', 'resolved', 'rejected', 'reviewed'),
      defaultValue: 'open',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('disputes', 'type');
    await queryInterface.removeColumn('disputes', 'category');
    await queryInterface.removeColumn('disputes', 'rating');

    await queryInterface.changeColumn('disputes', 'order_id', {
      type: Sequelize.UUID,
      allowNull: false,
    });
    await queryInterface.changeColumn('disputes', 'vendor_id', {
      type: Sequelize.UUID,
      allowNull: false,
    });
    await queryInterface.changeColumn('disputes', 'reason', {
      type: Sequelize.ENUM(
        'wrong_item', 'damaged_item', 'short_quantity',
        'non_delivery', 'quality_issue', 'overcharged', 'other'
      ),
      allowNull: false,
    });
    await queryInterface.changeColumn('disputes', 'status', {
      type: Sequelize.ENUM('open', 'investigating', 'resolved', 'rejected'),
      defaultValue: 'open',
    });
  },
};
