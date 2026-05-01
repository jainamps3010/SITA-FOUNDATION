'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('consumption_surveys', 'invoice_photos_urls', {
      type: Sequelize.ARRAY(Sequelize.TEXT),
      allowNull: true,
      defaultValue: []
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('consumption_surveys', 'invoice_photos_urls');
  }
};
