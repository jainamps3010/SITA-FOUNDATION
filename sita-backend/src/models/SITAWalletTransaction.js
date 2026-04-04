'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SITAWalletTransaction = sequelize.define('SITAWalletTransaction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    member_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('credit', 'debit'),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    balance_after: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    reason: {
      type: DataTypes.ENUM(
        'order_refund', 'dispute_resolution', 'admin_credit',
        'order_payment', 'membership_refund'
      ),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    reference_id: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    tableName: 'sita_wallet_transactions',
    timestamps: true,
    underscored: true
  });

  return SITAWalletTransaction;
};
