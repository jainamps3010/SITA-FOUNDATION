'use strict';

const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { Op, QueryTypes } = require('sequelize');
const { authenticateAdmin } = require('../middleware/auth');
const {
  Member, Vendor, Product, Order, OrderItem,
  Dispute, SITAWalletTransaction, Admin, sequelize,
  SurveyEntity, ConsumptionSurvey, SurveyAgent
} = require('../models');
const { paginate, paginatedResponse } = require('../utils/helpers');
const {
  sendMemberApprovalEmail,
  sendMemberRejectionEmail,
  sendPaymentVerifiedEmail,
} = require('../services/emailService');

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
      cancelledOrders,
      openDisputes,
      commissionRevenue,
      membershipRevenue,
      membershipPaidCount,
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
      Order.count({ where: { status: 'cancelled' } }),
      Dispute.count({ where: { status: { [Op.in]: ['open', 'investigating'] } } }),
      Order.sum('sita_commission', { where: { status: 'delivered' } }),
      Member.sum('membership_fee', { where: { payment_status: 'verified' } }),
      Member.count({ where: { payment_status: 'verified' } }),
      Member.count({ where: { membership_status: 'expired' } }),
      Member.count({
        where: {
          membership_status: 'active',
          membership_expiry_date: { [Op.between]: [today, thirtyDaysStr] }
        }
      })
    ]);

    // Cancellation revenue = total_amount - refund_amount for cancelled orders
    const cancellationRows = await sequelize.query(`
      SELECT COALESCE(SUM(
        o.total_amount - COALESCE(
          (SELECT SUM(wt.amount) FROM sita_wallet_transactions wt
           WHERE wt.order_id = o.id AND wt.reason = 'order_refund'), 0
        )
      ), 0) AS cancellation_revenue,
      COUNT(o.id) AS cancellation_count
      FROM orders o
      WHERE o.status = 'cancelled'
    `, { type: QueryTypes.SELECT });
    const cancellationRevenue = parseFloat(cancellationRows[0]?.cancellation_revenue || 0);
    const cancellationCount = parseInt(cancellationRows[0]?.cancellation_count || 0);

    const membershipRev = parseFloat(membershipRevenue || 0);
    const commissionRev = parseFloat(commissionRevenue || 0);
    const totalRevenue = membershipRev + commissionRev + cancellationRevenue;

    // Monthly trend — last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const membershipMonthly = await sequelize.query(`
      SELECT TO_CHAR(payment_verified_at, 'YYYY-MM') AS month,
             COALESCE(SUM(membership_fee), 0) AS amount
      FROM members
      WHERE payment_status = 'verified' AND payment_verified_at >= :since
      GROUP BY month ORDER BY month
    `, { replacements: { since: sixMonthsAgo }, type: QueryTypes.SELECT });

    const commissionMonthly = await sequelize.query(`
      SELECT TO_CHAR(delivered_at, 'YYYY-MM') AS month,
             COALESCE(SUM(sita_commission), 0) AS amount
      FROM orders
      WHERE status = 'delivered' AND delivered_at >= :since
      GROUP BY month ORDER BY month
    `, { replacements: { since: sixMonthsAgo }, type: QueryTypes.SELECT });

    const cancellationMonthly = await sequelize.query(`
      SELECT TO_CHAR(o.cancelled_at, 'YYYY-MM') AS month,
             COALESCE(SUM(
               o.total_amount - COALESCE(
                 (SELECT SUM(wt.amount) FROM sita_wallet_transactions wt
                  WHERE wt.order_id = o.id AND wt.reason = 'order_refund'), 0
               )
             ), 0) AS amount
      FROM orders o
      WHERE o.status = 'cancelled' AND o.cancelled_at >= :since
      GROUP BY month ORDER BY month
    `, { replacements: { since: sixMonthsAgo }, type: QueryTypes.SELECT });

    // Build last-6-months labels and merge data
    const monthLabels = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      monthLabels.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }

    const toMap = (rows) => Object.fromEntries(rows.map(r => [r.month, parseFloat(r.amount)]));
    const memMap = toMap(membershipMonthly);
    const comMap = toMap(commissionMonthly);
    const canMap = toMap(cancellationMonthly);

    const monthly_trend = monthLabels.map(m => ({
      month: m,
      membership: memMap[m] || 0,
      commission: comMap[m] || 0,
      cancellation: canMap[m] || 0,
      total: (memMap[m] || 0) + (comMap[m] || 0) + (canMap[m] || 0)
    }));

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
        orders: { total: totalOrders, pending: pendingOrders, delivered: deliveredOrders, cancelled: cancelledOrders },
        disputes: { open: openDisputes },
        revenue: {
          sita_commission_total: commissionRev.toFixed(2),
          membership_revenue: membershipRev.toFixed(2),
          commission_revenue: commissionRev.toFixed(2),
          cancellation_revenue: cancellationRevenue.toFixed(2),
          total_revenue: totalRevenue.toFixed(2),
          membership_paid_count: membershipPaidCount,
          cancellation_count: cancellationCount
        },
        memberships: { expired: expiredMemberships, expiring_this_month: expiringThisMonth },
        monthly_trend
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
    if (req.query.payment_status) where.payment_status = req.query.payment_status;
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
    sendMemberApprovalEmail(member).catch(() => {});
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
    sendMemberRejectionEmail(member, req.body.reason).catch(() => {});
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

// POST /admin/members/:id/verify-payment
router.post('/members/:id/verify-payment', async (req, res, next) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    if (member.payment_status !== 'pending_verification') {
      return res.status(400).json({ success: false, message: 'No pending payment to verify' });
    }

    const membershipFee = parseFloat(process.env.MEMBERSHIP_FEE) || 5000;
    const today = new Date();
    const expiryDate = new Date(today);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    await member.update({
      payment_status: 'verified',
      payment_verified_by: req.admin.id,
      payment_verified_at: today,
      membership_paid: true,
      membership_fee: membershipFee,
      membership_paid_at: today,
      membership_start_date: today.toISOString().split('T')[0],
      membership_expiry_date: expiryDate.toISOString().split('T')[0],
      membership_status: 'active',
      membership_active: true
    });

    sendPaymentVerifiedEmail(member).catch(() => {});
    res.json({ success: true, message: 'Payment verified and membership activated', member });
  } catch (err) { next(err); }
});

// POST /admin/members/:id/reject-payment
router.post('/members/:id/reject-payment', [
  body('reason').notEmpty().withMessage('Rejection reason required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    if (member.payment_status !== 'pending_verification') {
      return res.status(400).json({ success: false, message: 'No pending payment to reject' });
    }

    await member.update({
      payment_status: 'rejected',
      payment_rejection_reason: req.body.reason
    });

    res.json({ success: true, message: 'Payment rejected', member });
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
    const vendor = await Vendor.create({
      name:                req.body.name,
      email:               req.body.email,
      phone:               req.body.phone,
      company_name:        req.body.company_name,
      gstin:               req.body.gstin         || null,
      category:            req.body.category,
      description:         req.body.description   || null,
      address:             req.body.address        || null,
      city:                req.body.city           || null,
      state:               req.body.state          || null,
      bank_account_number: req.body.bank_account_number || null,
      bank_ifsc:           req.body.bank_ifsc       || null,
      bank_account_name:   req.body.bank_account_name   || null,
      status:              'pending',
    });
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
    if (req.query.type === 'feedback') {
      where.type = 'feedback';
    } else {
      where.type = { [Op.or]: [{ [Op.eq]: 'dispute' }, { [Op.is]: null }] };
    }

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

// PUT /admin/disputes/:id/mark-reviewed
router.put('/disputes/:id/mark-reviewed', async (req, res, next) => {
  try {
    const dispute = await Dispute.findByPk(req.params.id);
    if (!dispute) return res.status(404).json({ success: false, message: 'Not found' });
    await dispute.update({ status: 'reviewed', resolved_at: new Date(), resolved_by: req.admin.id });
    res.json({ success: true, message: 'Marked as reviewed', dispute });
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

// ─── SURVEY AGENTS ───────────────────────────────────────────────────────────

// POST /admin/survey-agents/add  — admin pre-registers an agent (approved immediately)
router.post('/survey-agents/add', async (req, res, next) => {
  try {
    const { name, mobile, district, taluka } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Agent name is required' });
    if (!mobile || !/^\d{10}$/.test(mobile)) return res.status(400).json({ success: false, message: 'Valid 10-digit mobile required' });
    if (!district || !district.trim()) return res.status(400).json({ success: false, message: 'District is required' });

    const existing = await SurveyAgent.findOne({ where: { mobile } });
    if (existing) return res.status(409).json({ success: false, message: 'Agent with this mobile already exists' });

    const agent = await SurveyAgent.create({
      name: name.trim(),
      mobile,
      district: district.trim(),
      taluka: taluka?.trim() || null,
      status: 'approved',
      added_by: req.admin.id
    });

    res.status(201).json({ success: true, message: 'Agent added successfully', data: agent });
  } catch (err) { next(err); }
});

// DELETE /admin/survey-agents/:id
router.delete('/survey-agents/:id', async (req, res, next) => {
  try {
    const agent = await SurveyAgent.findByPk(req.params.id);
    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });
    await agent.destroy();
    res.json({ success: true, message: 'Agent deleted' });
  } catch (err) { next(err); }
});

// GET /admin/survey-agents
router.get('/survey-agents', async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const where = {};
    if (status) where.status = status;

    const { count, rows } = await SurveyAgent.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit)
    });

    res.json({
      success: true,
      data: rows,
      pagination: { total: count, page: Number(page), limit: Number(limit), pages: Math.ceil(count / Number(limit)) }
    });
  } catch (err) { next(err); }
});

// POST /admin/survey-agents/:id/approve
router.post('/survey-agents/:id/approve', async (req, res, next) => {
  try {
    const agent = await SurveyAgent.findByPk(req.params.id);
    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });

    await agent.update({ status: 'approved', added_by: req.admin.id });
    res.json({ success: true, message: 'Agent approved', data: agent });
  } catch (err) { next(err); }
});

// POST /admin/survey-agents/:id/block
router.post('/survey-agents/:id/block', async (req, res, next) => {
  try {
    const agent = await SurveyAgent.findByPk(req.params.id);
    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });

    await agent.update({ status: 'blocked' });
    res.json({ success: true, message: 'Agent blocked', data: agent });
  } catch (err) { next(err); }
});

// POST /admin/survey-agents/:id/unblock
router.post('/survey-agents/:id/unblock', async (req, res, next) => {
  try {
    const agent = await SurveyAgent.findByPk(req.params.id);
    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });

    await agent.update({ status: 'approved' });
    res.json({ success: true, message: 'Agent unblocked', data: agent });
  } catch (err) { next(err); }
});

// ─── SURVEY PHOTOS ────────────────────────────────────────────────────────────

// GET /admin/survey-photos
router.get('/survey-photos', async (req, res, next) => {
  try {
    const { district, entity_type, date_from, date_to, page = 1, limit = 20 } = req.query;

    const entityWhere = {};
    if (district) entityWhere.district = district;
    if (entity_type) entityWhere.entity_type = entity_type;
    if (date_from || date_to) {
      entityWhere.created_at = {};
      if (date_from) entityWhere.created_at[Op.gte] = new Date(date_from);
      if (date_to) entityWhere.created_at[Op.lte] = new Date(date_to + 'T23:59:59Z');
    }

    const { count, rows } = await SurveyEntity.findAndCountAll({
      where: entityWhere,
      include: [{
        model: ConsumptionSurvey,
        as: 'consumption_data',
        attributes: ['id', 'product_name', 'invoice_photo_url', 'invoice_photos_urls', 'created_at'],
        required: false
      }],
      order: [['created_at', 'DESC']],
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit),
      distinct: true
    });

    const data = rows.map(entity => {
      const items = entity.consumption_data || [];
      const photoUrl = items.find(i => i.invoice_photo_url)?.invoice_photo_url || null;
      const allPhotos = items.flatMap(i => i.invoice_photos_urls || []);
      const uniquePhotos = [...new Set(allPhotos)];
      return {
        id: entity.id,
        entity_name: entity.entity_name,
        owner_name: entity.owner_name,
        entity_type: entity.entity_type,
        district: entity.district,
        taluka: entity.taluka,
        agent_id: entity.agent_id,
        survey_date: entity.created_at,
        products_count: items.length,
        invoice_photo_url: photoUrl,
        invoice_photos_urls: uniquePhotos.length > 0 ? uniquePhotos : null
      };
    });

    res.json({
      success: true,
      data,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(count / Number(limit))
      }
    });
  } catch (err) { next(err); }
});

// DELETE /admin/survey-photos/bulk — clear photos for selected entity ids
router.delete('/survey-photos/bulk', async (req, res, next) => {
  try {
    console.log('[DELETE /survey-photos/bulk] body:', req.body);
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return res.status(400).json({ success: false, message: 'ids array required' });
    const [count] = await ConsumptionSurvey.update(
      { invoice_photo_url: null, invoice_photos_urls: null },
      { where: { entity_id: { [Op.in]: ids } } }
    );
    console.log('[DELETE /survey-photos/bulk] updated rows:', count);
    res.json({ success: true, deleted: count });
  } catch (err) {
    console.error('[DELETE /survey-photos/bulk] error:', err.message);
    next(err);
  }
});

// DELETE /admin/survey-photos/delete-all — clear all invoice photos
router.delete('/survey-photos/delete-all', async (req, res, next) => {
  try {
    console.log('[DELETE /survey-photos/delete-all] called');
    const [count] = await ConsumptionSurvey.update(
      { invoice_photo_url: null, invoice_photos_urls: null },
      { where: { [Op.or]: [
        { invoice_photo_url: { [Op.ne]: null } },
        { invoice_photos_urls: { [Op.ne]: null } }
      ] } }
    );
    console.log('[DELETE /survey-photos/delete-all] updated rows:', count);
    res.json({ success: true, deleted: count });
  } catch (err) {
    console.error('[DELETE /survey-photos/delete-all] error:', err.message);
    next(err);
  }
});

// DELETE /admin/survey-photos/:id — clear invoice photo for entity (id = entity id)
router.delete('/survey-photos/:id', async (req, res, next) => {
  try {
    console.log('[DELETE /survey-photos/:id] id:', req.params.id);
    const [count] = await ConsumptionSurvey.update(
      { invoice_photo_url: null, invoice_photos_urls: null },
      { where: { entity_id: req.params.id } }
    );
    console.log('[DELETE /survey-photos/:id] updated rows:', count);
    res.json({ success: true, deleted: count });
  } catch (err) {
    console.error('[DELETE /survey-photos/:id] error:', err.message);
    next(err);
  }
});

// ─── SURVEY DATA ──────────────────────────────────────────────────────────────

// GET /admin/survey-data
router.get('/survey-data', async (req, res, next) => {
  try {
    const { district, entity_type, category, date_from, date_to } = req.query;

    const entityWhere = {};
    if (district) entityWhere.district = district;
    if (entity_type) entityWhere.entity_type = entity_type;

    const productWhere = {};
    if (category) productWhere.category = category;
    if (date_from || date_to) {
      productWhere.created_at = {};
      if (date_from) productWhere.created_at[Op.gte] = new Date(date_from);
      if (date_to) productWhere.created_at[Op.lte] = new Date(date_to + 'T23:59:59Z');
    }

    const rows = await ConsumptionSurvey.findAll({
      where: productWhere,
      include: [{
        model: SurveyEntity,
        as: 'entity',
        where: entityWhere,
        attributes: ['id', 'entity_name', 'owner_name', 'entity_type', 'district', 'taluka', 'agent_id']
      }],
      order: [['created_at', 'DESC']]
    });

    // Summary stats
    const entityIds = new Set(rows.map(r => r.entity_id));
    const demandMap = {};
    rows.forEach(r => {
      demandMap[r.product_name] = (demandMap[r.product_name] || 0) + Number(r.monthly_quantity);
    });
    const topProduct = Object.entries(demandMap).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    const data = rows.map(r => ({
      id: r.id,
      entity_id: r.entity_id,
      entity_name: r.entity?.entity_name,
      entity_type: r.entity?.entity_type,
      district: r.entity?.district,
      taluka: r.entity?.taluka,
      agent_id: r.entity?.agent_id,
      product_name: r.product_name,
      brand: r.brand,
      category: r.category,
      monthly_quantity: r.monthly_quantity,
      annual_quantity: r.annual_quantity,
      unit: r.unit,
      price_per_unit: r.price_per_unit,
      survey_date: r.created_at
    }));

    res.json({
      success: true,
      data,
      summary: {
        total_entities: entityIds.size,
        total_products: rows.length,
        top_product: topProduct
      }
    });
  } catch (err) { next(err); }
});

// DELETE /admin/survey/bulk — delete multiple entities + their consumption records
router.delete('/survey/bulk', async (req, res, next) => {
  try {
    console.log('[DELETE /survey/bulk] body:', req.body);
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return res.status(400).json({ success: false, message: 'ids array required' });
    await ConsumptionSurvey.destroy({ where: { entity_id: { [Op.in]: ids } } });
    await SurveyEntity.destroy({ where: { id: { [Op.in]: ids } } });
    console.log('[DELETE /survey/bulk] deleted entities:', ids.length);
    res.json({ success: true, deleted: ids.length });
  } catch (err) {
    console.error('[DELETE /survey/bulk] error:', err.message);
    next(err);
  }
});

// DELETE /admin/survey/:id — delete entity + all its consumption records
router.delete('/survey/:id', async (req, res, next) => {
  try {
    console.log('[DELETE /survey/:id] id:', req.params.id);
    const entity = await SurveyEntity.findByPk(req.params.id);
    if (!entity) return res.status(404).json({ success: false, message: 'Survey not found' });
    await ConsumptionSurvey.destroy({ where: { entity_id: req.params.id } });
    await entity.destroy();
    console.log('[DELETE /survey/:id] deleted entity:', req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('[DELETE /survey/:id] error:', err.message);
    next(err);
  }
});

module.exports = router;
