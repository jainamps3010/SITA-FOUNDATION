'use strict';

const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    ...(dbConfig.dialectOptions && { dialectOptions: dbConfig.dialectOptions })
  }
);

// Import models
const Admin = require('./Admin')(sequelize);
const Member = require('./Member')(sequelize);
const Vendor = require('./Vendor')(sequelize);
const Product = require('./Product')(sequelize);
const MasterContract = require('./MasterContract')(sequelize);
const Order = require('./Order')(sequelize);
const OrderItem = require('./OrderItem')(sequelize);
const SITAWalletTransaction = require('./SITAWalletTransaction')(sequelize);
const Dispute = require('./Dispute')(sequelize);
const SurveyEntity = require('./SurveyEntity')(sequelize);
const ConsumptionSurvey = require('./ConsumptionSurvey')(sequelize);

// Associations
Vendor.hasMany(Product, { foreignKey: 'vendor_id', as: 'products' });
Product.belongsTo(Vendor, { foreignKey: 'vendor_id', as: 'vendor' });

Member.hasMany(Order, { foreignKey: 'member_id', as: 'orders' });
Order.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });

Vendor.hasMany(Order, { foreignKey: 'vendor_id', as: 'orders' });
Order.belongsTo(Vendor, { foreignKey: 'vendor_id', as: 'vendor' });

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'order_items' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Member.hasMany(SITAWalletTransaction, { foreignKey: 'member_id', as: 'wallet_transactions' });
SITAWalletTransaction.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });

Order.hasOne(Dispute, { foreignKey: 'order_id', as: 'dispute' });
Dispute.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

Member.hasMany(Dispute, { foreignKey: 'member_id', as: 'disputes' });
Dispute.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });

Vendor.hasMany(Dispute, { foreignKey: 'vendor_id', as: 'disputes' });
Dispute.belongsTo(Vendor, { foreignKey: 'vendor_id', as: 'vendor' });

Member.hasMany(MasterContract, { foreignKey: 'member_id', as: 'contracts' });
MasterContract.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });

Vendor.hasMany(MasterContract, { foreignKey: 'vendor_id', as: 'contracts' });
MasterContract.belongsTo(Vendor, { foreignKey: 'vendor_id', as: 'vendor' });

Product.hasMany(MasterContract, { foreignKey: 'product_id', as: 'contracts' });
MasterContract.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

SITAWalletTransaction.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

SurveyEntity.hasMany(ConsumptionSurvey, { foreignKey: 'entity_id', as: 'consumption_data' });
ConsumptionSurvey.belongsTo(SurveyEntity, { foreignKey: 'entity_id', as: 'entity' });

module.exports = {
  sequelize,
  Sequelize,
  Admin,
  Member,
  Vendor,
  Product,
  MasterContract,
  Order,
  OrderItem,
  SITAWalletTransaction,
  Dispute,
  SurveyEntity,
  ConsumptionSurvey
};
