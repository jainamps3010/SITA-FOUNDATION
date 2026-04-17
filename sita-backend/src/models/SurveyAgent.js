'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SurveyAgent = sequelize.define('SurveyAgent', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    mobile: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'blocked'),
      allowNull: false,
      defaultValue: 'pending'
    },
    added_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    total_surveys: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    last_survey_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    district: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    taluka: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    tableName: 'survey_agents',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return SurveyAgent;
};
