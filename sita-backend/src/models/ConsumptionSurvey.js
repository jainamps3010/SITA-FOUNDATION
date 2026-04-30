'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ConsumptionSurvey = sequelize.define('ConsumptionSurvey', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    entity_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'survey_entities', key: 'id' }
    },
    product_name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    brand: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    category: {
      type: DataTypes.ENUM('Oils', 'Grains', 'Spices', 'Gas', 'Cleaning'),
      allowNull: false
    },
    monthly_quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    annual_quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    unit: {
      type: DataTypes.ENUM('Kg', 'Liters', 'Bags', 'Cylinders'),
      allowNull: false
    },
    price_per_unit: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0
    },
    invoice_photo_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    invoice_photos_urls: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null
    }
  }, {
    tableName: 'consumption_surveys',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return ConsumptionSurvey;
};
