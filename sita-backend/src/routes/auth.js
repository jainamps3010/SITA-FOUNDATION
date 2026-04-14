'use strict';

const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { Member, Admin } = require('../models');
const { generateOTP } = require('../utils/helpers');

// ─── In-memory OTP store for driver auth ──────────────────────────────────────
// Accepts both 'mobile' and 'phone' fields from the request body.
// Key: mobile number string. Value: { otp, expiresAt }
const driverOtpStore = new Map();

// POST /auth/send-otp  — driver app login step 1
router.post('/send-otp', (req, res) => {
  const mobile = req.body.mobile || req.body.phone;

  if (!mobile || !/^\d{10}$/.test(mobile)) {
    return res.status(400).json({ success: false, message: 'Valid 10-digit mobile number required' });
  }

  const otp = generateOTP();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  driverOtpStore.set(mobile, { otp, expiresAt });

  console.log(`\nDEV OTP for ${mobile}: ${otp}\n`);

  res.json({ success: true, message: 'OTP sent' });
});

// POST /auth/verify-otp  — driver app login step 2
router.post('/verify-otp', async (req, res) => {
  const mobile = req.body.mobile || req.body.phone;
  const { otp } = req.body;

  if (!mobile || !/^\d{10}$/.test(mobile)) {
    return res.status(400).json({ success: false, message: 'Valid 10-digit mobile number required' });
  }
  if (!otp || otp.length !== 6) {
    return res.status(400).json({ success: false, message: '6-digit OTP required' });
  }

  const stored = driverOtpStore.get(mobile);

  if (!stored) {
    return res.status(400).json({ success: false, message: 'No OTP requested for this number. Please request a new OTP.' });
  }

  if (Date.now() > stored.expiresAt) {
    driverOtpStore.delete(mobile);
    return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
  }

  const bypassOtp = process.env.OTP_BYPASS;
  const isValid = (bypassOtp && otp === bypassOtp) || stored.otp === otp;

  if (!isValid) {
    return res.status(400).json({ success: false, message: 'Invalid OTP' });
  }

  driverOtpStore.delete(mobile);

  const token = jwt.sign(
    { mobile, phone: mobile, type: 'driver' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    message: 'Login successful',
    token,
    driver: { phone: mobile, mobile }
  });
});

// POST /auth/member/send-otp
router.post('/member/send-otp', [
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit Indian mobile number required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { phone } = req.body;
    let member = await Member.findOne({ where: { phone } });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Phone number not registered. Please contact SITA Foundation.',
        code: 'NOT_REGISTERED'
      });
    }

    if (member.status === 'rejected') {
      return res.status(403).json({
        success: false,
        message: 'Your application has been rejected. Please contact support.',
        code: 'REJECTED'
      });
    }

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES) || 10) * 60 * 1000);

    await member.update({ otp, otp_expires_at: otpExpiresAt });

    // In production: send via SMS (Twilio/MSG91/etc.)
    // In development: log to console
    console.log(`\n[OTP] Phone: ${phone} → OTP: ${otp} (expires: ${otpExpiresAt.toISOString()})\n`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      // Dev only - remove in production:
      ...(process.env.NODE_ENV === 'development' && { dev_otp: otp })
    });
  } catch (err) {
    next(err);
  }
});

// POST /auth/member/verify-otp
router.post('/member/verify-otp', [
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Valid phone required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('6-digit OTP required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { phone, otp } = req.body;
    const member = await Member.findOne({ where: { phone } });

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // Allow bypass OTP in dev
    const bypassOtp = process.env.OTP_BYPASS;
    const isValid = (bypassOtp && otp === bypassOtp) || member.isOtpValid(otp);

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Clear OTP
    await member.update({ otp: null, otp_expires_at: null });

    const token = jwt.sign(
      { id: member.id, phone: member.phone, type: 'member' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      member: {
        id: member.id,
        name: member.name,
        phone: member.phone,
        hotel_name: member.hotel_name,
        status: member.status,
        membership_paid: member.membership_paid,
        sita_wallet_balance: member.sita_wallet_balance
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /auth/register — self-registration for new members
// Accepts: mobile (or phone), name, business_name (or hotel_name), gst_number, address, email, city, state, pincode
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('mobile').optional().matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit mobile required'),
  body('phone').optional().matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit mobile required'),
  body('business_name').optional().notEmpty(),
  body('hotel_name').optional().notEmpty(),
  body('email').optional({ nullable: true, checkFalsy: true }).isEmail().withMessage('Valid email required'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Accept both new (mobile/business_name) and old (phone/hotel_name) field names
    const phone = (req.body.mobile || req.body.phone || '').trim();
    const hotelName = (req.body.business_name || req.body.hotel_name || '').trim();

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Valid 10-digit mobile number required' });
    }
    if (!hotelName) {
      return res.status(400).json({ success: false, message: 'Business/hotel name is required' });
    }

    const existing = await Member.findOne({ where: { phone } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'This mobile number is already registered' });
    }

    const member = await Member.create({
      name:          req.body.name.trim(),
      phone,
      email:         req.body.email || null,
      hotel_name:    hotelName,
      hotel_address: (req.body.address || req.body.hotel_address || '').trim() || null,
      city:          req.body.city?.trim()    || null,
      state:         req.body.state?.trim()   || null,
      pincode:       req.body.pincode?.trim() || null,
      gstin:         (req.body.gst_number || req.body.gstin || '').trim() || null,
      status:        'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Registration submitted. Awaiting admin approval.',
      member: { id: member.id, name: member.name, phone: member.phone, status: member.status }
    });
  } catch (err) { next(err); }
});

// POST /auth/admin/login
router.post('/admin/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;
    const admin = await Admin.findOne({ where: { email, is_active: true } });

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role, type: 'admin' },
      process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET,
      { expiresIn: process.env.ADMIN_JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      admin: admin.toJSON()
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
