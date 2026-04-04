'use strict';

const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { Member, Admin } = require('../models');
const { generateOTP } = require('../utils/helpers');

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
