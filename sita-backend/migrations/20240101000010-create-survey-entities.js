'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('survey_entities', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      agent_id: {
        type: Sequelize.STRING(15),
        allowNull: false
      },
      entity_name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      owner_name: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      mobile: {
        type: Sequelize.STRING(15),
        allowNull: false
      },
      entity_type: {
        type: Sequelize.ENUM(
          'Hotel',
          'Restaurant',
          'Resort',
          'Caterer',
          'Annakshetra',
          'Temple Kitchen'
        ),
        allowNull: false
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      district: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      taluka: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    await queryInterface.addIndex('survey_entities', ['agent_id']);
    await queryInterface.addIndex('survey_entities', ['district']);
    await queryInterface.addIndex('survey_entities', ['entity_type']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('survey_entities');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_survey_entities_entity_type";'
    );
  }
};
