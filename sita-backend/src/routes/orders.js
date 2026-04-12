'use strict';

const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { authenticateMember, requireMembership } = require('../middleware/auth');
const { Order, OrderItem, Product, Vendor, Member, Dispute, SITAWalletTransaction, sequelize } = require('../models');
const { generateOrderNumber, generateDeliveryOTP, calculateSplit } = require('../utils/helpers');

// POST /orders - Create new order
router.post('/', authenticateMember, requireMembership, [
  body('vendor_id').isUUID().withMessage('Valid vendor ID required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item required'),
  body('items.*.product_id').isUUID().withMessage('Valid product ID required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be >= 1'),
  body('delivery_address').notEmpty().withMessage('Delivery address required'),
  body('payment_method').optional().isIn(['wallet', 'bank_transfer', 'upi', 'cash'])
], async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await t.rollback();
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { vendor_id, items, delivery_address, payment_method = 'bank_transfer', notes } = req.body;

    // Verify vendor is active
    const vendor = await Vendor.findOne({ where: { id: vendor_id, status: 'active' }, transaction: t });
    if (!vendor) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Vendor not found or not active' });
    }

    // Validate all items belong to this vendor
    const productIds = items.map(i => i.product_id);
    const products = await Product.findAll({
      where: { id: productIds, vendor_id, approved: true, available: true },
      transaction: t
    });

    if (products.length !== productIds.length) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'One or more products are invalid or unavailable' });
    }

    // Build order items and calculate total
    const productMap = {};
    products.forEach(p => { productMap[p.id] = p; });

    let total_amount = 0;
    let market_total = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = productMap[item.product_id];
      if (item.quantity < product.moq) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `Minimum order quantity for "${product.name}" is ${product.moq} ${product.unit}`
        });
      }
      const item_total = parseFloat((product.price_per_unit * item.quantity).toFixed(2));
      // Use market_price for foundation fee basis; fall back to sita price if not set
      const market_price = parseFloat(product.market_price || product.price_per_unit);
      const item_market_total = parseFloat((market_price * item.quantity).toFixed(2));
      total_amount += item_total;
      market_total += item_market_total;
      orderItemsData.push({
        product_id: product.id,
        quantity: item.quantity,
        unit_price: product.price_per_unit,
        total_price: item_total,
        product_name: product.name,
        product_unit: product.unit
      });
    }

    total_amount = parseFloat(total_amount.toFixed(2));
    market_total = parseFloat(market_total.toFixed(2));
    // Foundation fee = 2% of market value, vendor gets member_total - foundation_fee
    const { sita_commission, vendor_amount } = calculateSplit(total_amount, market_total);

    // Handle wallet payment
    let wallet_amount_used = 0;
    if (payment_method === 'wallet') {
      const walletBalance = parseFloat(req.member.sita_wallet_balance);
      if (walletBalance < total_amount) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient wallet balance. Balance: ₹${walletBalance}, Required: ₹${total_amount}`
        });
      }
      wallet_amount_used = total_amount;
    }

    // Create order
    const delivery_otp = generateDeliveryOTP();
    const order = await Order.create({
      order_number: generateOrderNumber(),
      member_id: req.member.id,
      vendor_id,
      status: 'pending',
      total_amount,
      sita_commission,
      vendor_amount,
      payment_method,
      payment_status: payment_method === 'wallet' ? 'paid' : 'pending',
      delivery_otp,
      delivery_address,
      wallet_amount_used,
      notes
    }, { transaction: t });

    // Create order items
    const orderItems = orderItemsData.map(i => ({ ...i, order_id: order.id }));
    await OrderItem.bulkCreate(orderItems, { transaction: t });

    // Deduct wallet balance if paid by wallet
    if (payment_method === 'wallet') {
      const newBalance = parseFloat((req.member.sita_wallet_balance - wallet_amount_used).toFixed(2));
      await req.member.update({ sita_wallet_balance: newBalance }, { transaction: t });
      await SITAWalletTransaction.create({
        member_id: req.member.id,
        type: 'debit',
        amount: wallet_amount_used,
        balance_after: newBalance,
        reason: 'order_payment',
        description: `Payment for order ${order.order_number}`,
        order_id: order.id
      }, { transaction: t });
    }

    await t.commit();

    console.log(`\n[Delivery OTP] Order ${order.order_number} → OTP: ${delivery_otp}\n`);

    const fullOrder = await Order.findByPk(order.id, {
      include: [
        { model: OrderItem, as: 'items' },
        { model: Vendor, as: 'vendor', attributes: ['id', 'company_name', 'phone'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: fullOrder,
      // Dev only - delivery OTP for testing
      ...(process.env.NODE_ENV === 'development' && { dev_delivery_otp: delivery_otp })
    });
  } catch (err) {
    await t.rollback();
    next(err);
  }
});

// GET /orders/:id
router.get('/:id', authenticateMember, async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, member_id: req.member.id },
      include: [
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'image_url'] }] },
        { model: Vendor, as: 'vendor', attributes: ['id', 'company_name', 'phone', 'email'] },
        { model: Dispute, as: 'dispute' }
      ]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (err) { next(err); }
});

// POST /orders/:id/dispute - Raise a dispute
router.post('/:id/dispute', authenticateMember, [
  body('reason').isIn([
    'wrong_item', 'damaged_item', 'short_quantity',
    'non_delivery', 'quality_issue', 'overcharged', 'other'
  ]).withMessage('Valid reason required'),
  body('description').notEmpty().isLength({ min: 20 }).withMessage('Description must be at least 20 characters')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const order = await Order.findOne({
      where: { id: req.params.id, member_id: req.member.id }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!['delivered', 'confirmed', 'dispatched'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Disputes can only be raised for confirmed/dispatched/delivered orders'
      });
    }

    const existingDispute = await Dispute.findOne({ where: { order_id: order.id } });
    if (existingDispute) {
      return res.status(400).json({ success: false, message: 'Dispute already exists for this order' });
    }

    const dispute = await Dispute.create({
      order_id: order.id,
      member_id: req.member.id,
      vendor_id: order.vendor_id,
      reason: req.body.reason,
      description: req.body.description,
      status: 'open'
    });

    await order.update({ status: 'disputed' });

    res.status(201).json({ success: true, message: 'Dispute raised successfully', dispute });
  } catch (err) { next(err); }
});

module.exports = router;
