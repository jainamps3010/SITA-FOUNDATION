'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Dispute = sequelize.define('Dispute', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    type: {
      type: DataTypes.ENUM('dispute', 'feedback'),
      defaultValue: 'dispute'
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    member_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    vendor_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    reason: {
      type: DataTypes.ENUM(
        'wrong_item', 'damaged_item', 'short_quantity',
        'non_delivery', 'quality_issue', 'overcharged', 'other'
      ),
      allowNull: true
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'For feedback: Product Quality, Delivery Issue, App Problem, Pricing Issue, Other'
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Star rating 1-5, for feedback type'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('open', 'investigating', 'resolved', 'rejected', 'reviewed'),
      defaultValue: 'open'
    },
    resolution: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    refund_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true
    },
    refund_to_wallet: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    resolved_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    resolved_by: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Admin ID who resolved'
    }
  }, {
    tableName: 'disputes',
    timestamps: true,
    underscored: true
  });

  return Dispute;
};
