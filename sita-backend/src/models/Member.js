'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Member = sequelize.define('Member', {
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
      allowNull: true,
      validate: { isEmail: true }
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: true
    },
    hotel_name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    hotel_address: {
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
    pincode: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    gstin: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'active', 'suspended', 'rejected'),
      defaultValue: 'pending'
    },
    membership_paid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    membership_fee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    membership_paid_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    sita_wallet_balance: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0
    },
    otp: {
      type: DataTypes.STRING(6),
      allowNull: true
    },
    otp_expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'members',
    timestamps: true,
    underscored: true
  });

  Member.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.otp;
    delete values.otp_expires_at;
    return values;
  };

  Member.prototype.isOtpValid = function(otp) {
    if (!this.otp || !this.otp_expires_at) return false;
    if (new Date() > new Date(this.otp_expires_at)) return false;
    return this.otp === otp;
  };

  return Member;
};
