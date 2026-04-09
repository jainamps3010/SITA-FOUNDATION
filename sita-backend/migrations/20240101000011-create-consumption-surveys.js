'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('consumption_surveys', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      entity_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'survey_entities', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      product_name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      brand: {
        type: Sequelize.STRING(150),
        allowNull: true
      },
      category: {
        type: Sequelize.ENUM('Oils', 'Grains', 'Spices', 'Gas', 'Cleaning'),
        allowNull: false
      },
      monthly_quantity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      annual_quantity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      unit: {
        type: Sequelize.ENUM('Kg', 'Liters', 'Bags', 'Cylinders'),
        allowNull: false
      },
      price_per_unit: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
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

    await queryInterface.addIndex('consumption_surveys', ['entity_id']);
    await queryInterface.addIndex('consumption_surveys', ['category']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('consumption_surveys');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_consumption_surveys_category";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_consumption_surveys_unit";'
    );
  }
};
