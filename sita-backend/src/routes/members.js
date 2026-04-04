'use strict';

const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { authenticateMember, requireMembership } = require('../middleware/auth');
const { Member, SITAWalletTransaction, Order, OrderItem, Product, Vendor } = require('../models');
const { paginate, paginatedResponse } = require('../utils/helpers');

// GET /members/profile
router.get('/profile', authenticateMember, async (req, res, next) => {
  try {
    res.json({ success: true, member: req.member });
  } catch (err) { next(err); }
});

// PUT /members/profile
router.put('/profile', authenticateMember, [
  body('name').optional().notEmpty(),
  body('email').optional().isEmail(),
  body('hotel_address').optional().notEmpty(),
  body('city').optional().notEmpty(),
  body('state').optional().notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const allowed = ['name', 'email', 'hotel_name', 'hotel_address', 'city', 'state', 'pincode', 'gstin'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    await req.member.update(updates);
    res.json({ success: true, message: 'Profile updated', member: req.member });
  } catch (err) { next(err); }
});

// POST /members/membership/pay - Pay non-refundable membership fee
router.post('/membership/pay', authenticateMember, async (req, res, next) => {
  try {
    if (req.member.membership_paid) {
      return res.status(400).json({ success: false, message: 'Membership already paid' });
    }

    const membershipFee = parseFloat(process.env.MEMBERSHIP_FEE) || 5000;

    // In production: integrate payment gateway (Razorpay/PayU)
    // Here we simulate successful payment
    await req.member.update({
      membership_paid: true,
      membership_fee: membershipFee,
      membership_paid_at: new Date()
    });

    res.json({
      success: true,
      message: `Membership fee of ₹${membershipFee} paid successfully. Note: This fee is non-refundable.`,
      member: req.member
    });
  } catch (err) { next(err); }
});

// GET /members/wallet
router.get('/wallet', authenticateMember, async (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query);
    const { count, rows } = await SITAWalletTransaction.findAndCountAll({
      where: { member_id: req.member.id },
      order: [['created_at', 'DESC']],
      limit, offset
    });

    res.json({
      success: true,
      balance: parseFloat(req.member.sita_wallet_balance),
      ...paginatedResponse(rows, count, page, limit)
    });
  } catch (err) { next(err); }
});

// GET /members/orders
router.get('/orders', authenticateMember, async (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query);
    const where = { member_id: req.member.id };
    if (req.query.status) where.status = req.query.status;

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: Vendor, as: 'vendor', attributes: ['id', 'company_name', 'phone'] },
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }] }
      ],
      order: [['created_at', 'DESC']],
      limit, offset
    });

    res.json({ success: true, ...paginatedResponse(rows, count, page, limit) });
  } catch (err) { next(err); }
});

// GET /members/register - Register a new member (admin creates, or self-register)
router.post('/register', [
  body('name').notEmpty().withMessage('Name required'),
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit mobile required'),
  body('hotel_name').notEmpty().withMessage('Hotel name required'),
  body('email').optional().isEmail()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const existing = await Member.findOne({ where: { phone: req.body.phone } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Phone number already registered' });
    }

    const member = await Member.create({
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      hotel_name: req.body.hotel_name,
      hotel_address: req.body.hotel_address,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      gstin: req.body.gstin,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Registration submitted. Awaiting admin approval.',
      member: { id: member.id, name: member.name, phone: member.phone, status: member.status }
    });
  } catch (err) { next(err); }
});

module.exports = router;
