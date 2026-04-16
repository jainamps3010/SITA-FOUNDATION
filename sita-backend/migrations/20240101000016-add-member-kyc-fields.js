'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_members_category" AS ENUM (
          'hotels_restaurants', 'caterers', 'religious_annkshetra',
          'bhojan_shala', 'tea_post_cafe', 'ngo_charitable'
        );
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.addColumn('members', 'category', {
      type: Sequelize.ENUM(
        'hotels_restaurants', 'caterers', 'religious_annkshetra',
        'bhojan_shala', 'tea_post_cafe', 'ngo_charitable'
      ),
      allowNull: true,
    });
    await queryInterface.addColumn('members', 'gst_number', {
      type: Sequelize.STRING(20), allowNull: true,
    });
    await queryInterface.addColumn('members', 'business_reg_certificate_url', {
      type: Sequelize.STRING(500), allowNull: true,
    });
    await queryInterface.addColumn('members', 'fssai_license_url', {
      type: Sequelize.STRING(500), allowNull: true,
    });
    await queryInterface.addColumn('members', 'establishment_front_photo_url', {
      type: Sequelize.STRING(500), allowNull: true,
    });
    await queryInterface.addColumn('members', 'billing_counter_photo_url', {
      type: Sequelize.STRING(500), allowNull: true,
    });
    await queryInterface.addColumn('members', 'kitchen_photo_url', {
      type: Sequelize.STRING(500), allowNull: true,
    });
    await queryInterface.addColumn('members', 'menu_card_photo_url', {
      type: Sequelize.STRING(500), allowNull: true,
    });
    await queryInterface.addColumn('members', 'latitude', {
      type: Sequelize.DECIMAL(10, 7), allowNull: true,
    });
    await queryInterface.addColumn('members', 'longitude', {
      type: Sequelize.DECIMAL(10, 7), allowNull: true,
    });
    await queryInterface.addColumn('members', 'district', {
      type: Sequelize.STRING(100), allowNull: true,
    });
    await queryInterface.addColumn('members', 'geo_timestamp', {
      type: Sequelize.DATE, allowNull: true,
    });
  },

  down: async (queryInterface) => {
    const cols = [
      'category', 'gst_number', 'business_reg_certificate_url',
      'fssai_license_url', 'establishment_front_photo_url',
      'billing_counter_photo_url', 'kitchen_photo_url', 'menu_card_photo_url',
      'latitude', 'longitude', 'district', 'geo_timestamp',
    ];
    for (const col of cols) {
      await queryInterface.removeColumn('members', col);
    }
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_members_category";');
  },
};
