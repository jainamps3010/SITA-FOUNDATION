'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface) => {
    const adminId = uuidv4();
    const vendorId1 = uuidv4();
    const vendorId2 = uuidv4();
    const memberId1 = uuidv4();
    const memberId2 = uuidv4();
    const productId1 = uuidv4();
    const productId2 = uuidv4();
    const productId3 = uuidv4();
    const now = new Date();

    // Admin
    await queryInterface.bulkInsert('admins', [{
      id: adminId,
      name: 'SITA Super Admin',
      email: 'admin@sita.org',
      password: await bcrypt.hash('admin123', 12),
      role: 'superadmin',
      is_active: true,
      created_at: now,
      updated_at: now
    }]);

    // Vendors
    await queryInterface.bulkInsert('vendors', [
      {
        id: vendorId1,
        name: 'Rajesh Kumar',
        email: 'rajesh@freshfoods.in',
        phone: '9876543210',
        company_name: 'Fresh Foods India Pvt Ltd',
        gstin: '27AABCU9603R1ZX',
        category: 'food_beverages',
        description: 'Premium fresh vegetables and fruits supplier for hotels',
        address: '45, APMC Market, Vashi',
        city: 'Navi Mumbai',
        state: 'Maharashtra',
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        id: vendorId2,
        name: 'Priya Singh',
        email: 'priya@cleanlinens.in',
        phone: '9765432109',
        company_name: 'Clean Linens & Laundry Co',
        gstin: '07AADCS1234P1ZA',
        category: 'linen_laundry',
        description: 'Hotel-grade linens, towels and laundry services',
        address: 'Plot 12, Industrial Area Phase 2',
        city: 'Delhi',
        state: 'Delhi',
        status: 'active',
        created_at: now,
        updated_at: now
      }
    ]);

    // Products
    await queryInterface.bulkInsert('products', [
      {
        id: productId1,
        vendor_id: vendorId1,
        name: 'Fresh Tomatoes',
        description: 'Farm-fresh tomatoes, ideal for hotel kitchens',
        category: 'food_beverages',
        unit: 'kg',
        price_per_unit: 35.00,
        moq: 10,
        available: true,
        approved: true,
        sku: 'FFI-TOM-001',
        created_at: now,
        updated_at: now
      },
      {
        id: productId2,
        vendor_id: vendorId1,
        name: 'Basmati Rice Premium',
        description: 'Long grain premium basmati rice, 25kg bags',
        category: 'food_beverages',
        unit: 'bag (25kg)',
        price_per_unit: 1850.00,
        moq: 2,
        available: true,
        approved: true,
        sku: 'FFI-RIC-002',
        created_at: now,
        updated_at: now
      },
      {
        id: productId3,
        vendor_id: vendorId2,
        name: 'Hotel Bath Towel Set',
        description: 'Premium 500 GSM cotton bath towels, set of 10',
        category: 'linen_laundry',
        unit: 'set (10 pcs)',
        price_per_unit: 1200.00,
        moq: 5,
        available: true,
        approved: true,
        sku: 'CLL-TOW-001',
        created_at: now,
        updated_at: now
      }
    ]);

    // Members
    await queryInterface.bulkInsert('members', [
      {
        id: memberId1,
        name: 'Amit Sharma',
        email: 'amit@hotelgrand.in',
        phone: '9123456789',
        hotel_name: 'Hotel Grand Palace',
        hotel_address: '12, MG Road, Connaught Place',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        gstin: '07AAACH7409R1ZZ',
        status: 'active',
        membership_paid: true,
        membership_fee: 5000.00,
        membership_paid_at: now,
        sita_wallet_balance: 500.00,
        created_at: now,
        updated_at: now
      },
      {
        id: memberId2,
        name: 'Sunita Patel',
        email: 'sunita@hotelbluebay.in',
        phone: '9234567890',
        hotel_name: 'Blue Bay Hotel',
        hotel_address: '7, Beach Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400005',
        gstin: '27AAABP1234Q1ZA',
        status: 'pending',
        membership_paid: false,
        sita_wallet_balance: 0,
        created_at: now,
        updated_at: now
      }
    ]);

    console.log('\n✅ Seed complete!');
    console.log('   Admin: admin@sita.org / admin123');
    console.log('   Active Member: phone 9123456789, OTP bypass: 123456');
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('disputes', null, {});
    await queryInterface.bulkDelete('sita_wallet_transactions', null, {});
    await queryInterface.bulkDelete('order_items', null, {});
    await queryInterface.bulkDelete('orders', null, {});
    await queryInterface.bulkDelete('master_contracts', null, {});
    await queryInterface.bulkDelete('products', null, {});
    await queryInterface.bulkDelete('members', null, {});
    await queryInterface.bulkDelete('vendors', null, {});
    await queryInterface.bulkDelete('admins', null, {});
  }
};
