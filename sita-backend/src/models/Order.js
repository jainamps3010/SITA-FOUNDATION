'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    order_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    member_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    vendor_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM(
        'pending', 'confirmed', 'dispatched', 'delivered', 'cancelled', 'disputed'
      ),
      defaultValue: 'pending'
    },
    total_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    sita_commission: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      comment: '2% of total_amount'
    },
    vendor_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      comment: '98% of total_amount'
    },
    payment_method: {
      type: DataTypes.ENUM('wallet', 'bank_transfer', 'upi', 'cash'),
      defaultValue: 'bank_transfer'
    },
    payment_status: {
      type: DataTypes.ENUM('pending', 'paid', 'refunded'),
      defaultValue: 'pending'
    },
    delivery_otp: {
      type: DataTypes.STRING(6),
      allowNull: true
    },
    delivery_otp_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    delivery_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    expected_delivery_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cancelled_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cancellation_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    wallet_amount_used: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'orders',
    timestamps: true,
    underscored: true
  });

  return Order;
};
