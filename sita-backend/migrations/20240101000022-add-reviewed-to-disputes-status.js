module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query("ALTER TYPE enum_disputes_status ADD VALUE IF NOT EXISTS 'reviewed'");
    await queryInterface.sequelize.query("ALTER TYPE enum_disputes_status ADD VALUE IF NOT EXISTS 'resolved'");
  },
  down: async () => {}
};
