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
        'amenities', 'equipment', 'technology', 'furniture', 'other',
        'oils', 'grains', 'spices', 'gas', 'cleaning_supplies'
      ),
      allowNull: false
    },
    unit: {
      type: DataTypes.STRING(30),
      allowNull: false,
      comment: 'e.g. kg, litre, piece, dozen, carton'
    },
    market_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Original market / MRP price'
    },
    price_per_unit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'SITA special price shown to members'
    },
    moq: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: 'Minimum order quantity'
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Current available stock'
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
