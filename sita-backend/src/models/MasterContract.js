'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MasterContract = sequelize.define('MasterContract', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    vendor_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    member_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    negotiated_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    valid_from: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    valid_to: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'expired', 'cancelled'),
      defaultValue: 'active'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'master_contracts',
    timestamps: true,
    underscored: true
  });

  return MasterContract;
};
