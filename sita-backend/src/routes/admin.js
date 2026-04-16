'use strict';

const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { authenticateAdmin } = require('../middleware/auth');
const {
  Member, Vendor, Product, Order, OrderItem,
  Dispute, SITAWalletTransaction, Admin, sequelize
} = require('../models');
const { paginate, paginatedResponse } = require('../utils/helpers');

// All admin routes require admin auth
router.use(authenticateAdmin);

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

// GET /admin/dashboard/stats
router.get('/dashboard/stats', async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const thirtyDaysStr = thirtyDaysFromNow.toISOString().split('T')[0];

    const [
      totalMembers, activeMembers, pendingMembers,
      totalVendors, activeVendors,
      totalOrders, pendingOrders, deliveredOrders,
      openDisputes,
      totalRevenue,
      expiredMemberships,
      expiringThisMonth
    ] = await Promise.all([
      Member.count(),
      Member.count({ where: { status: 'active' } }),
      Member.count({ where: { status: 'pending' } }),
      Vendor.count(),
      Vendor.count({ where: { status: 'active' } }),
      Order.count(),
      Order.count({ where: { status: 'pending' } }),
      Order.count({ where: { status: 'delivered' } }),
      Dispute.count({ where: { status: { [Op.in]: ['open', 'investigating'] } } }),
      Order.sum('sita_commission', { where: { status: { [Op.notIn]: ['cancelled'] } } }),
      Member.count({ where: { membership_status: 'expired' } }),
      Member.count({
        where: {
          membership_status: 'active',
          membership_expiry_date: { [Op.between]: [today, thirtyDaysStr] }
        }
      })
    ]);

    const recentOrders = await Order.findAll({
      include: [
        { model: Member, as: 'member', attributes: ['id', 'name', 'hotel_name'] },
        { model: Vendor, as: 'vendor', attributes: ['id', 'company_name'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 5
    });

    res.json({
      success: true,
      stats: {
        members: { total: totalMembers, active: activeMembers, pending: pendingMembers },
        vendors: { total: totalVendors, active: activeVendors },
        orders: { total: totalOrders, pending: pendingOrders, delivered: deliveredOrders },
        disputes: { open: openDisputes },
        revenue: { sita_commission_total: parseFloat(totalRevenue || 0).toFixed(2) },
        memberships: { expired: expiredMemberships, expiring_this_month: expiringThisMonth }
      },
      recent_orders: recentOrders
    });
  } catch (err) { next(err); }
});

// ─── MEMBERS ──────────────────────────────────────────────────────────────────

// GET /admin/members
router.get('/members', async (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query);
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.membership_paid !== undefined) where.membership_paid = req.query.membership_paid === 'true';
    if (req.query.membership_status) where.membership_status = req.query.membership_status;
    if (req.query.category) where.category = req.query.category;
    if (req.query.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${req.query.search}%` } },
        { hotel_name: { [Op.iLike]: `%${req.query.search}%` } },
        { phone: { [Op.like]: `%${req.query.search}%` } }
      ];
    }
    const { count, rows } = await Member.findAndCountAll({
      where, order: [['created_at', 'DESC']], limit, offset
    });
    res.json({ success: true, ...paginatedResponse(rows, count, page, limit) });
  } catch (err) { next(err); }
});

// GET /admin/members/:id
router.get('/members/:id', async (req, res, next) => {
  try {
    const member = await Member.findByPk(req.params.id, {
      include: [
        { model: Order, as: 'orders', limit: 10, order: [['created_at', 'DESC']] },
        { model: SITAWalletTransaction, as: 'wallet_transactions', limit: 10, order: [['created_at', 'DESC']] }
      ]
    });
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, member });
  } catch (err) { next(err); }
});

// PUT /admin/members/:id/approve
router.put('/members/:id/approve', async (req, res, next) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    await member.update({ status: 'active', rejection_reason: null });
    res.json({ success: true, message: 'Member approved', member });
  } catch (err) { next(err); }
});

// PUT /admin/members/:id/reject
router.put('/members/:id/reject', [
  body('reason').notEmpty().withMessage('Rejection reason required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    await member.update({ status: 'rejected', rejection_reason: req.body.reason });
    res.json({ success: true, message: 'Member rejected', member });
  } catch (err) { next(err); }
});

// PUT /admin/members/:id/suspend
router.put('/members/:id/suspend', async (req, res, next) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    await member.update({ status: 'suspended' });
    res.json({ success: true, message: 'Member suspended', member });
  } catch (err) { next(err); }
});

// POST /admin/members/:id/wallet/credit - Add wallet balance
router.post('/members/:id/wallet/credit', [
  body('amount').isFloat({ min: 1 }).withMessage('Valid amount required'),
  body('reason').notEmpty().withMessage('Reason required')
], async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { await t.rollback(); return res.status(400).json({ success: false, errors: errors.array() }); }

    const member = await Member.findByPk(req.params.id, { transaction: t });
    if (!member) { await t.rollback(); return res.status(404).json({ success: false, message: 'Member not found' }); }

    const amount = parseFloat(req.body.amount);
    const newBalance = parseFloat((parseFloat(member.sita_wallet_balance) + amount).toFixed(2));

    await member.update({ sita_wallet_balance: newBalance }, { transaction: t });
    await SITAWalletTransaction.create({
      member_id: member.id,
      type: 'credit',
      amount,
      balance_after: newBalance,
      reason: 'admin_credit',
      description: req.body.reason
    }, { transaction: t });

    await t.commit();
    res.json({ success: true, message: `₹${amount} credited to wallet`, new_balance: newBalance });
  } catch (err) { await t.rollback(); next(err); }
});

// POST /admin/members/:id/wallet/debit - Deduct wallet balance
router.post('/members/:id/wallet/debit', [
  body('amount').isFloat({ min: 1 }).withMessage('Valid amount required'),
  body('reason').notEmpty().withMessage('Reason required')
], async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { await t.rollback(); return res.status(400).json({ success: false, errors: errors.array() }); }

    const member = await Member.findByPk(req.params.id, { transaction: t });
    if (!member) { await t.rollback(); return res.status(404).json({ success: false, message: 'Member not found' }); }

    const amount = parseFloat(req.body.amount);
    const currentBalance = parseFloat(member.sita_wallet_balance);

    if (currentBalance < amount) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
    }

    const newBalance = parseFloat((currentBalance - amount).toFixed(2));

    await member.update({ sita_wallet_balance: newBalance }, { transaction: t });
    await SITAWalletTransaction.create({
      member_id: member.id,
      type: 'debit',
      amount,
      balance_after: newBalance,
      reason: 'admin_debit',
      description: req.body.reason
    }, { transaction: t });

    await t.commit();
    res.json({ success: true, message: `₹${amount} deducted from wallet`, new_balance: newBalance });
  } catch (err) { await t.rollback(); next(err); }
});

// PUT /admin/members/:id/membership/mark-paid
router.put('/members/:id/membership/mark-paid', async (req, res, next) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    if (member.membership_paid) return res.status(400).json({ success: false, message: 'Membership already paid. Use extend-membership to add another year.' });
    const membershipFee = parseFloat(process.env.MEMBERSHIP_FEE) || 5000;
    const today = new Date();
    const expiryDate = new Date(today);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    await member.update({
      membership_paid: true,
      membership_fee: membershipFee,
      membership_paid_at: today,
      membership_start_date: today.toISOString().split('T')[0],
      membership_expiry_date: expiryDate.toISOString().split('T')[0],
      membership_status: 'active'
    });
    res.json({ success: true, message: 'Annual membership marked as paid', member });
  } catch (err) { next(err); }
});

// PUT /admin/members/:id/extend-membership - Extend membership by 1 year
router.put('/members/:id/extend-membership', async (req, res, next) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    if (!member.membership_paid) return res.status(400).json({ success: false, message: 'Member has no existing membership to extend' });

    // Extend from current expiry or from today if expired
    const baseDate = member.membership_expiry_date && new Date(member.membership_expiry_date) > new Date()
      ? new Date(member.membership_expiry_date)
      : new Date();
    const newExpiry = new Date(baseDate);
    newExpiry.setFullYear(newExpiry.getFullYear() + 1);

    await member.update({
      membership_expiry_date: newExpiry.toISOString().split('T')[0],
      membership_status: 'active',
      membership_paid_at: new Date()
    });
    res.json({ success: true, message: `Membership extended until ${newExpiry.toISOString().split('T')[0]}`, member });
  } catch (err) { next(err); }
});

// POST /admin/members/:id/cancel-membership
router.post('/members/:id/cancel-membership', async (req, res, next) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    if (member.membership_active === false) return res.status(400).json({ success: false, message: 'Membership already cancelled' });
    await member.update({ membership_active: false, membership_status: 'cancelled' });
    res.json({ success: true, message: 'Membership cancelled', member });
  } catch (err) { next(err); }
});

// POST /admin/members/:id/revoke-membership
router.post('/members/:id/revoke-membership', async (req, res, next) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    if (member.membership_active !== false) return res.status(400).json({ success: false, message: 'Membership is not cancelled' });
    await member.update({ membership_active: true, membership_status: 'active' });
    res.json({ success: true, message: 'Membership cancellation revoked', member });
  } catch (err) { next(err); }
});

// DELETE /admin/members/:id
router.delete('/members/:id', async (req, res, next) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    await member.destroy();
    res.json({ success: true, message: 'Member deleted' });
  } catch (err) { next(err); }
});

// ─── VENDORS ──────────────────────────────────────────────────────────────────

// GET /admin/vendors
router.get('/vendors', async (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query);
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.category) where.category = req.query.category;
    if (req.query.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${req.query.search}%` } },
        { company_name: { [Op.iLike]: `%${req.query.search}%` } }
      ];
    }
    const { count, rows } = await Vendor.findAndCountAll({
      where, order: [['created_at', 'DESC']], limit, offset
    });
    res.json({ success: true, ...paginatedResponse(rows, count, page, limit) });
  } catch (err) { next(err); }
});

// GET /admin/vendors/:id
router.get('/vendors/:id', async (req, res, next) => {
  try {
    const vendor = await Vendor.findByPk(req.params.id, {
      include: [{ model: Product, as: 'products', limit: 20 }]
    });
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    res.json({ success: true, vendor });
  } catch (err) { next(err); }
});

// PUT /admin/vendors/:id/approve
router.put('/vendors/:id/approve', async (req, res, next) => {
  try {
    const vendor = await Vendor.findByPk(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    await vendor.update({ status: 'active', rejection_reason: null });
    res.json({ success: true, message: 'Vendor approved', vendor });
  } catch (err) { next(err); }
});

// PUT /admin/vendors/:id/reject
router.put('/vendors/:id/reject', [
  body('reason').notEmpty().withMessage('Reason required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const vendor = await Vendor.findByPk(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    await vendor.update({ status: 'rejected', rejection_reason: req.body.reason });
    res.json({ success: true, message: 'Vendor rejected', vendor });
  } catch (err) { next(err); }
});

// POST /admin/vendors - Create vendor
router.post('/vendors', [
  body('name').notEmpty(), body('email').isEmail(),
  body('phone').notEmpty(), body('company_name').notEmpty(),
  body('category').notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const vendor = await Vendor.create(req.body);
    res.status(201).json({ success: true, vendor });
  } catch (err) { next(err); }
});

// DELETE /admin/vendors/:id
router.delete('/vendors/:id', async (req, res, next) => {
  try {
    const vendor = await Vendor.findByPk(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    await vendor.destroy();
    res.json({ success: true, message: 'Vendor deleted' });
  } catch (err) { next(err); }
});

// ─── PRODUCTS ──────────────────────────────────────────────────────────────────

// GET /admin/products
router.get('/products', async (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query);
    const where = {};
    if (req.query.approved !== undefined) where.approved = req.query.approved === 'true';
    if (req.query.vendor_id) where.vendor_id = req.query.vendor_id;
    if (req.query.category) where.category = req.query.category;

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{ model: Vendor, as: 'vendor', attributes: ['id', 'company_name', 'status'] }],
      order: [['created_at', 'DESC']],
      limit, offset
    });
    res.json({ success: true, ...paginatedResponse(rows, count, page, limit) });
  } catch (err) { next(err); }
});

// POST /admin/products — create a new product
router.post('/products', [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('vendor_id').isUUID().withMessage('Valid vendor ID is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('unit').trim().notEmpty().withMessage('Unit is required'),
  body('price_per_unit').isFloat({ gt: 0 }).withMessage('SITA price must be > 0'),
  body('market_price').optional({ nullable: true }).isFloat({ gt: 0 }),
  body('moq').optional().isInt({ min: 1 }),
  body('stock_quantity').optional().isInt({ min: 0 }),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const vendor = await Vendor.findByPk(req.body.vendor_id);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

    const product = await Product.create({
      vendor_id:      req.body.vendor_id,
      name:           req.body.name.trim(),
      description:    req.body.description?.trim() || null,
      category:       req.body.category,
      unit:           req.body.unit.trim(),
      market_price:   req.body.market_price   ? parseFloat(req.body.market_price)   : null,
      price_per_unit: parseFloat(req.body.price_per_unit),
      moq:            req.body.moq            ? parseInt(req.body.moq)            : 1,
      stock_quantity: req.body.stock_quantity ? parseInt(req.body.stock_quantity) : 0,
      sku:            req.body.sku?.trim()    || null,
      approved:       false,
      available:      true,
    });
    res.status(201).json({ success: true, message: 'Product created', product });
  } catch (err) { next(err); }
});

// POST /admin/products/bulk-upload — insert multiple products from CSV
// Body: { vendor_id: string, products: [{ name, category, sita_price, unit, market_price?, stock?, min_order_qty?, description? }] }
router.post('/products/bulk-upload', async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { vendor_id, products } = req.body;

    console.log('[bulk-upload] vendor_id:', vendor_id);
    console.log('[bulk-upload] products received:', JSON.stringify(products?.slice(0, 2)));

    if (!vendor_id) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'vendor_id is required' });
    }
    if (!Array.isArray(products) || products.length === 0) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'No products provided' });
    }

    // Validate vendor once
    const vendor = await Vendor.findByPk(vendor_id, { transaction: t });
    if (!vendor) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    const created = [];
    const skipped = [];

    for (const p of products) {
      const name      = String(p.name      || '').trim();
      const category  = String(p.category  || '').trim();
      const unit      = String(p.unit      || '').trim();
      const sitaPrice = parseFloat(p.sita_price);

      // Skip rows missing required fields
      if (!name || !category || !unit || isNaN(sitaPrice) || sitaPrice <= 0) {
        skipped.push({ row: p, reason: 'missing required field (name/category/unit/sita_price)' });
        continue;
      }

      const product = await Product.create({
        vendor_id,
        name,
        description:    String(p.description || '').trim() || null,
        category,
        unit,
        market_price:   p.market_price !== '' && p.market_price != null ? parseFloat(p.market_price) : null,
        price_per_unit: sitaPrice,
        moq:            p.min_order_qty !== '' && p.min_order_qty != null ? parseInt(p.min_order_qty) || 1 : 1,
        stock_quantity: p.stock !== '' && p.stock != null ? parseInt(p.stock) || 0 : 0,
        approved:       false,
        available:      true,
      }, { transaction: t });
      created.push(product);
    }

    console.log('[bulk-upload] created:', created.length, '| skipped:', skipped.length);
    if (skipped.length) console.log('[bulk-upload] skipped rows:', JSON.stringify(skipped));

    await t.commit();
    res.status(201).json({
      success: true,
      message: `${created.length} product${created.length !== 1 ? 's' : ''} added successfully`,
      count: created.length,
      ...(skipped.length && { skipped: skipped.length }),
    });
  } catch (err) { await t.rollback(); next(err); }
});

// PUT /admin/products/:id — edit an existing product
router.put('/products/:id', [
  body('name').optional().trim().notEmpty(),
  body('category').optional().notEmpty(),
  body('unit').optional().trim().notEmpty(),
  body('price_per_unit').optional().isFloat({ gt: 0 }),
  body('market_price').optional({ nullable: true }).isFloat({ gt: 0 }),
  body('moq').optional().isInt({ min: 1 }),
  body('stock_quantity').optional().isInt({ min: 0 }),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const updates = {};
    const fields = ['name', 'description', 'category', 'unit', 'price_per_unit',
                    'market_price', 'moq', 'stock_quantity', 'sku'];
    for (const f of fields) {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    }
    await product.update(updates);
    res.json({ success: true, message: 'Product updated', product });
  } catch (err) { next(err); }
});

// PUT /admin/products/:id/approve
router.put('/products/:id/approve', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    await product.update({ approved: true });
    res.json({ success: true, message: 'Product approved', product });
  } catch (err) { next(err); }
});

// PUT /admin/products/:id/reject
router.put('/products/:id/reject', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    await product.update({ approved: false, available: false });
    res.json({ success: true, message: 'Product rejected', product });
  } catch (err) { next(err); }
});

// DELETE /admin/products/:id
router.delete('/products/:id', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    await product.destroy();
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) { next(err); }
});

// ─── ORDERS ────────────────────────────────────────────────────────────────────

// GET /admin/orders
router.get('/orders', async (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query);
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.vendor_id) where.vendor_id = req.query.vendor_id;
    if (req.query.member_id) where.member_id = req.query.member_id;

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: Member, as: 'member', attributes: ['id', 'name', 'hotel_name', 'phone'] },
        { model: Vendor, as: 'vendor', attributes: ['id', 'company_name'] },
        { model: OrderItem, as: 'items' }
      ],
      order: [['created_at', 'DESC']],
      limit, offset
    });
    res.json({ success: true, ...paginatedResponse(rows, count, page, limit) });
  } catch (err) { next(err); }
});

// GET /admin/orders/:id
router.get('/orders/:id', async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: Member, as: 'member' },
        { model: Vendor, as: 'vendor' },
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
        { model: Dispute, as: 'dispute' }
      ]
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) { next(err); }
});

// PUT /admin/orders/:id/status
router.put('/orders/:id/status', [
  body('status').isIn(['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'])
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const updates = { status: req.body.status };
    if (req.body.status === 'cancelled') {
      updates.cancelled_at = new Date();
      updates.cancellation_reason = req.body.reason;
    }
    if (req.body.status === 'delivered') {
      updates.delivered_at = new Date();
    }

    await order.update(updates);
    res.json({ success: true, message: 'Order status updated', order });
  } catch (err) { next(err); }
});

// DELETE /admin/orders/:id
router.delete('/orders/:id', async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    await OrderItem.destroy({ where: { order_id: order.id } });
    await order.destroy();
    res.json({ success: true, message: 'Order deleted' });
  } catch (err) { next(err); }
});

// ─── DISPUTES ─────────────────────────────────────────────────────────────────

// GET /admin/disputes
router.get('/disputes', async (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query);
    const where = {};
    if (req.query.status) where.status = req.query.status;

    const { count, rows } = await Dispute.findAndCountAll({
      where,
      include: [
        { model: Member, as: 'member', attributes: ['id', 'name', 'hotel_name', 'phone'] },
        { model: Vendor, as: 'vendor', attributes: ['id', 'company_name'] },
        { model: Order, as: 'order', attributes: ['id', 'order_number', 'total_amount', 'status'] }
      ],
      order: [['created_at', 'DESC']],
      limit, offset
    });
    res.json({ success: true, ...paginatedResponse(rows, count, page, limit) });
  } catch (err) { next(err); }
});

// GET /admin/disputes/:id
router.get('/disputes/:id', async (req, res, next) => {
  try {
    const dispute = await Dispute.findByPk(req.params.id, {
      include: [
        { model: Member, as: 'member' },
        { model: Vendor, as: 'vendor' },
        { model: Order, as: 'order', include: [{ model: OrderItem, as: 'items' }] }
      ]
    });
    if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found' });
    res.json({ success: true, dispute });
  } catch (err) { next(err); }
});

// PUT /admin/disputes/:id/resolve
router.put('/disputes/:id/resolve', [
  body('resolution').notEmpty().withMessage('Resolution notes required'),
  body('refund_amount').optional().isFloat({ min: 0 }),
  body('refund_to_wallet').optional().isBoolean()
], async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { await t.rollback(); return res.status(400).json({ success: false, errors: errors.array() }); }

    const dispute = await Dispute.findByPk(req.params.id, { transaction: t });
    if (!dispute) { await t.rollback(); return res.status(404).json({ success: false, message: 'Dispute not found' }); }

    if (dispute.status === 'resolved' || dispute.status === 'rejected') {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Dispute already closed' });
    }

    const refund_amount = parseFloat(req.body.refund_amount) || 0;
    const refund_to_wallet = req.body.refund_to_wallet === true || req.body.refund_to_wallet === 'true';

    // Process wallet refund if applicable
    if (refund_amount > 0 && refund_to_wallet) {
      const member = await Member.findByPk(dispute.member_id, { transaction: t });
      const newBalance = parseFloat((parseFloat(member.sita_wallet_balance) + refund_amount).toFixed(2));
      await member.update({ sita_wallet_balance: newBalance }, { transaction: t });
      await SITAWalletTransaction.create({
        member_id: member.id,
        type: 'credit',
        amount: refund_amount,
        balance_after: newBalance,
        reason: 'dispute_resolution',
        description: `Refund for dispute on order ${dispute.order_id}`,
        order_id: dispute.order_id
      }, { transaction: t });
    }

    await dispute.update({
      status: 'resolved',
      resolution: req.body.resolution,
      refund_amount: refund_amount || null,
      refund_to_wallet,
      resolved_at: new Date(),
      resolved_by: req.admin.id
    }, { transaction: t });

    // Update order status if delivered
    const order = await Order.findByPk(dispute.order_id, { transaction: t });
    if (order && order.status === 'disputed') {
      await order.update({ status: 'delivered' }, { transaction: t });
    }

    await t.commit();
    res.json({ success: true, message: 'Dispute resolved', dispute });
  } catch (err) { await t.rollback(); next(err); }
});

// PUT /admin/disputes/:id/reject
router.put('/disputes/:id/reject', [
  body('resolution').notEmpty().withMessage('Rejection reason required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const dispute = await Dispute.findByPk(req.params.id);
    if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found' });

    await dispute.update({
      status: 'rejected',
      resolution: req.body.resolution,
      resolved_at: new Date(),
      resolved_by: req.admin.id
    });

    res.json({ success: true, message: 'Dispute rejected', dispute });
  } catch (err) { next(err); }
});

module.exports = router;
