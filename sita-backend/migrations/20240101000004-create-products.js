'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create ENUM type explicitly first — Sequelize's inline ENUM creation inside
    // createTable can leave the type in a broken state on a failed run, causing
    // "column does not exist" on retry. The DO block is idempotent.
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_products_category" AS ENUM (
          'food_beverages', 'housekeeping', 'linen_laundry',
          'amenities', 'equipment', 'technology', 'furniture', 'other'
        );
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.createTable('products', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      vendor_id: {
        type: Sequelize.UUID, allowNull: false,
        references: { model: 'vendors', key: 'id' },
        onDelete: 'CASCADE'
      },
      name: { type: Sequelize.STRING(200), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      category: {
        type: Sequelize.ENUM(
          'food_beverages', 'housekeeping', 'linen_laundry',
          'amenities', 'equipment', 'technology', 'furniture', 'other'
        ),
        allowNull: false
      },
      unit: { type: Sequelize.STRING(30), allowNull: false },
      price_per_unit: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      moq: { type: Sequelize.INTEGER, defaultValue: 1 },
      available: { type: Sequelize.BOOLEAN, defaultValue: true },
      approved: { type: Sequelize.BOOLEAN, defaultValue: false },
      image_url: { type: Sequelize.STRING(500), allowNull: true },
      sku: { type: Sequelize.STRING(50), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });
    await queryInterface.addIndex('products', ['vendor_id']);
    await queryInterface.addIndex('products', ['category']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('products');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_products_category";');
  }
};
