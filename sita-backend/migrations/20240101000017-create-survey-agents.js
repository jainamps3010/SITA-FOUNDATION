module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('survey_agents', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: { type: Sequelize.STRING, allowNull: false },
      mobile: { type: Sequelize.STRING, allowNull: false, unique: true },
      district: { type: Sequelize.STRING },
      taluka: { type: Sequelize.STRING },
      status: {
        type: Sequelize.ENUM('approved', 'blocked'),
        defaultValue: 'approved'
      },
      total_surveys: { type: Sequelize.INTEGER, defaultValue: 0 },
      last_survey_at: { type: Sequelize.DATE },
      added_by: { type: Sequelize.UUID },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('survey_agents');
  }
};
