'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();

    // ── Fetch existing members & vendors ─────────────────────────────────────
    const [members] = await queryInterface.sequelize.query(
      `SELECT id, name, hotel_address FROM members WHERE status = 'active' LIMIT 2`
    );
    const [vendors] = await queryInterface.sequelize.query(
      `SELECT id FROM vendors WHERE status = 'active' LIMIT 1`
    );
    const [products] = await queryInterface.sequelize.query(
      `SELECT id, name, unit, price_per_unit FROM products WHERE approved = true LIMIT 3`
    );

    if (members.length === 0) {
      console.warn('⚠️  No active members found — run the base seeder first (npx sequelize-cli db:seed:all)');
      return;
    }
    if (vendors.length === 0) {
      console.warn('⚠️  No active vendors found — run the base seeder first');
      return;
    }

    const member1 = members[0];
    const member2 = members[1] || members[0];
    const vendor = vendors[0];
    const product1 = products[0];
    const product2 = products[1] || products[0];

    // ── Orders ────────────────────────────────────────────────────────────────
    const orderId1 = uuidv4();
    const orderId2 = uuidv4();

    const order1Total = product1 ? parseFloat(product1.price_per_unit) * 5 : 875.00;
    const order2Total = product2 ? parseFloat(product2.price_per_unit) * 2 : 3700.00;

    await queryInterface.bulkInsert('orders', [
      {
        id: orderId1,
        order_number: 'ORD-DEMO-001',
        member_id: member1.id,
        vendor_id: vendor.id,
        status: 'dispatched',
        total_amount: order1Total,
        sita_commission: parseFloat((order1Total * 0.02).toFixed(2)),
        vendor_amount: parseFloat((order1Total * 0.98).toFixed(2)),
        payment_method: 'bank_transfer',
        payment_status: 'pending',
        delivery_otp: '123456',
        delivery_otp_verified: false,
        delivery_address: member1.hotel_address || '12, MG Road, Connaught Place, New Delhi',
        expected_delivery_date: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Demo dispatched order 1',
        created_at: now,
        updated_at: now
      },
      {
        id: orderId2,
        order_number: 'ORD-DEMO-002',
        member_id: member2.id,
        vendor_id: vendor.id,
        status: 'dispatched',
        total_amount: order2Total,
        sita_commission: parseFloat((order2Total * 0.02).toFixed(2)),
        vendor_amount: parseFloat((order2Total * 0.98).toFixed(2)),
        payment_method: 'wallet',
        payment_status: 'pending',
        delivery_otp: '654321',
        delivery_otp_verified: false,
        delivery_address: member2.hotel_address || '7, Beach Road, Mumbai',
        expected_delivery_date: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Demo dispatched order 2',
        created_at: now,
        updated_at: now
      }
    ]);

    // ── Order Items ───────────────────────────────────────────────────────────
    const items = [];

    if (product1) {
      items.push({
        id: uuidv4(),
        order_id: orderId1,
        product_id: product1.id,
        product_name: product1.name,
        product_unit: product1.unit,
        quantity: 5,
        unit_price: parseFloat(product1.price_per_unit),
        total_price: parseFloat(product1.price_per_unit) * 5,
        created_at: now,
        updated_at: now
      });
    }

    if (product2) {
      items.push({
        id: uuidv4(),
        order_id: orderId2,
        product_id: product2.id,
        product_name: product2.name,
        product_unit: product2.unit,
        quantity: 2,
        unit_price: parseFloat(product2.price_per_unit),
        total_price: parseFloat(product2.price_per_unit) * 2,
        created_at: now,
        updated_at: now
      });
    }

    if (items.length > 0) {
      await queryInterface.bulkInsert('order_items', items);
    }

    console.log('\n✅ Delivery seed complete!');
    console.log('   Order 1: ORD-DEMO-001 — OTP: 123456 —', member1.name || member1.id);
    console.log('   Order 2: ORD-DEMO-002 — OTP: 654321 —', member2.name || member2.id);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('order_items', {
      order_id: { [require('sequelize').Op.in]:
        queryInterface.sequelize.query(
          `SELECT id FROM orders WHERE order_number IN ('ORD-DEMO-001','ORD-DEMO-002')`,
          { type: 'SELECT' }
        )
      }
    }, {});
    await queryInterface.bulkDelete('orders', {
      order_number: ['ORD-DEMO-001', 'ORD-DEMO-002']
    }, {});
  }
};
