'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Vendor = sequelize.define('Vendor', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    company_name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    gstin: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    category: {
      type: DataTypes.ENUM(
        'food_beverages', 'housekeeping', 'linen_laundry',
        'amenities', 'equipment', 'technology', 'furniture', 'other'
      ),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    bank_account_number: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    bank_ifsc: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    bank_account_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'active', 'suspended', 'rejected'),
      defaultValue: 'pending'
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'vendors',
    timestamps: true,
    underscored: true
  });

  return Vendor;
};
