module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('consumption_surveys', 'invoice_photo_url', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('consumption_surveys', 'invoice_photo_url');
  }
};
