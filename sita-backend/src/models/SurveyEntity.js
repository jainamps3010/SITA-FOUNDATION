'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SurveyEntity = sequelize.define('SurveyEntity', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    agent_id: {
      type: DataTypes.STRING(15),
      allowNull: false,
      comment: 'Phone number of the field agent who submitted this survey'
    },
    entity_name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    owner_name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    mobile: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    entity_type: {
      type: DataTypes.ENUM(
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
      type: DataTypes.TEXT,
      allowNull: false
    },
    district: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    taluka: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    tableName: 'survey_entities',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return SurveyEntity;
};
