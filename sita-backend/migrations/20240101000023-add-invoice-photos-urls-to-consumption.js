'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('consumption_surveys', 'invoice_photos_urls', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: null
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('consumption_surveys', 'invoice_photos_urls');
  }
};
