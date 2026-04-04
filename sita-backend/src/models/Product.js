'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    vendor_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.ENUM(
        'food_beverages', 'housekeeping', 'linen_laundry',
        'amenities', 'equipment', 'technology', 'furniture', 'other'
      ),
      allowNull: false
    },
    unit: {
      type: DataTypes.STRING(30),
      allowNull: false,
      comment: 'e.g. kg, litre, piece, dozen, carton'
    },
    price_per_unit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    moq: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: 'Minimum order quantity'
    },
    available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    sku: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    tableName: 'products',
    timestamps: true,
    underscored: true
  });

  return Product;
};
