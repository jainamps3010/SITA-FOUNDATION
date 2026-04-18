'use strict';

const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { Member, Admin, SurveyAgent } = require('../models');
const { generateOTP } = require('../utils/helpers');
const { createSecureUpload } = require('../middleware/uploadSecurity');

// ─── Secure KYC upload (shared helper enforces MIME + extension + 10 MB) ──────
const kycUpload = createSecureUpload('kyc');
const kycFields = kycUpload.fields([
  { name: 'business_reg_certificate', maxCount: 1 },
  { name: 'fssai_license',            maxCount: 1 },
  { name: 'establishment_front_photo',maxCount: 1 },
  { name: 'billing_counter_photo',    maxCount: 1 },
  { name: 'kitchen_photo',            maxCount: 1 },
  { name: 'menu_card_photo',          maxCount: 1 },
]);

// ─── In-memory OTP store for driver / survey-agent auth ───────────────────────
// Key: mobile number.  Value: { otp, expiresAt, attempts }
const driverOtpStore = new Map();

// ─── POST /auth/send-otp  — delivery driver / survey agent ────────────────────
router.post('/send-otp', async (req, res) => {
  const mobile = req.body.mobile || req.body.phone;
  const role   = req.body.role;

  if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
    return res.status(400).json({ success: false, message: 'Valid 10-digit mobile number required' });
  }

  if (role === 'survey_agent') {
    const agent = await SurveyAgent.findOne({ where: { mobile } });
    if (!agent) {
      return res.status(403).json({ success: false, message: 'Access denied. Contact SITA Foundation admin.', code: 'NOT_REGISTERED' });
    }
    if (agent.status === 'blocked') {
      return res.status(403).json({ success: false, message: 'Your access has been blocked.', code: 'BLOCKED' });
    }
    if (agent.status !== 'approved') {
      return res.status(403).json({ success: false, message: 'Account pending approval.', code: 'PENDING' });
    }
  }

  const otp       = generateOTP();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  driverOtpStore.set(mobile, { otp, expiresAt, attempts: 0 });
  console.log(`\n[DEV OTP] ${mobile}: ${otp}\n`);

  res.json({ success: true, message: 'OTP sent' });
});

// ─── POST /auth/verify-otp  — delivery driver / survey agent ──────────────────
router.post('/verify-otp', async (req, res) => {
  const mobile = req.body.mobile || req.body.phone;
  const { otp } = req.body;

  if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
    return res.status(400).json({ success: false, message: 'Valid 10-digit mobile number required' });
  }
  if (!otp || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({ success: false, message: '6-digit OTP required' });
  }

  const stored = driverOtpStore.get(mobile);
  if (!stored) {
    return res.status(400).json({ success: false, message: 'No OTP requested for this number.' });
  }
  if (Date.now() > stored.expiresAt) {
    driverOtpStore.delete(mobile);
    return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
  }

  // Track failed attempts per entry (belt-and-suspenders alongside per-mobile rate limiter)
  stored.attempts = (stored.attempts || 0) + 1;
  if (stored.attempts > 5) {
    driverOtpStore.delete(mobile);
    return res.status(429).json({ success: false, message: 'Too many incorrect attempts. Please request a new OTP.' });
  }

  const bypassOtp = process.env.OTP_BYPASS;
  const isValid   = (bypassOtp && otp === bypassOtp) || stored.otp === otp;

  if (!isValid) {
    return res.status(400).json({ success: false, message: 'Invalid OTP' });
  }

  driverOtpStore.delete(mobile);

  const token = jwt.sign(
    { mobile, phone: mobile, type: 'driver' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  const agent = await SurveyAgent.findOne({ where: { mobile } });

  res.json({
    success: true,
    message: 'Login successful',
    token,
    agent_status: agent ? agent.status : null,
    driver: { phone: mobile, mobile },
  });
});

// ─── POST /auth/member/send-otp ───────────────────────────────────────────────
router.post('/member/send-otp', [
  body('phone')
    .trim()
    .matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit Indian mobile number required'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { phone } = req.body;
    const member = await Member.findOne({ where: { phone } });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Phone number not registered. Please contact SITA Foundation.',
        code: 'NOT_REGISTERED',
      });
    }

    if (member.status === 'rejected') {
      return res.status(403).json({
        success: false,
        message: 'Your application has been rejected. Please contact support.',
        code: 'REJECTED',
      });
    }

    const otp         = generateOTP();
    const expMinutes  = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;
    const otpExpiresAt = new Date(Date.now() + expMinutes * 60 * 1000);

    await member.update({ otp, otp_expires_at: otpExpiresAt });

    // Production: send via SMS gateway (Twilio / MSG91 / etc.)
    console.log(`\n[OTP] ${phone} → ${otp}  (expires ${otpExpiresAt.toISOString()})\n`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      // Expose OTP in response body only in development — never in production
      ...(process.env.NODE_ENV === 'development' && { dev_otp: otp }),
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /auth/member/verify-otp ─────────────────────────────────────────────
router.post('/member/verify-otp', [
  body('phone')
    .trim()
    .matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit Indian mobile number required'),
  body('otp')
    .trim()
    .matches(/^\d{6}$/).withMessage('6-digit numeric OTP required'),
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

    const bypassOtp = process.env.OTP_BYPASS;
    const isValid   = (bypassOtp && otp === bypassOtp) || member.isOtpValid(otp);

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Consume OTP — prevent replay
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
        id:                 member.id,
        name:               member.name,
        phone:              member.phone,
        hotel_name:         member.hotel_name,
        hotel_address:      member.hotel_address,
        city:               member.city,
        state:              member.state,
        status:             member.status,
        membership_paid:    member.membership_paid,
        membership_expiry:  member.membership_expiry,
        sita_wallet_balance: member.sita_wallet_balance,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /auth/register — self-registration with KYC uploads ─────────────────
router.post('/register', kycFields, async (req, res, next) => {
  try {
    const phone     = (req.body.mobile || req.body.phone || '').trim();
    const hotelName = (req.body.business_name || req.body.hotel_name || '').trim();
    const name      = (req.body.name || '').trim();

    if (!name)
      return res.status(400).json({ success: false, message: 'Name is required' });
    if (!phone || !/^[6-9]\d{9}$/.test(phone))
      return res.status(400).json({ success: false, message: 'Valid 10-digit mobile number required' });
    if (!hotelName)
      return res.status(400).json({ success: false, message: 'Business name is required' });

    const existing = await Member.findOne({ where: { phone } });
    if (existing)
      return res.status(409).json({ success: false, message: 'This mobile number is already registered' });

    const fileUrl = (fieldName) => {
      const f = req.files?.[fieldName]?.[0];
      return f ? `/uploads/kyc/${f.filename}` : null;
    };

    const lat = req.body.latitude  ? parseFloat(req.body.latitude)  : null;
    const lng = req.body.longitude ? parseFloat(req.body.longitude) : null;

    const member = await Member.create({
      name,
      phone,
      email:                           req.body.email?.trim() || null,
      hotel_name:                      hotelName,
      hotel_address:                   (req.body.address || req.body.hotel_address || '').trim() || null,
      city:                            req.body.city?.trim()    || null,
      state:                           req.body.state?.trim()   || null,
      pincode:                         req.body.pincode?.trim() || null,
      district:                        req.body.district?.trim()|| null,
      gstin:                           (req.body.gst_number || req.body.gstin || '').trim() || null,
      gst_number:                      (req.body.gst_number || req.body.gstin || '').trim() || null,
      category:                        req.body.category || null,
      business_reg_certificate_url:    fileUrl('business_reg_certificate'),
      fssai_license_url:               fileUrl('fssai_license'),
      establishment_front_photo_url:   fileUrl('establishment_front_photo'),
      billing_counter_photo_url:       fileUrl('billing_counter_photo'),
      kitchen_photo_url:               fileUrl('kitchen_photo'),
      menu_card_photo_url:             fileUrl('menu_card_photo'),
      latitude:                        lat,
      longitude:                       lng,
      geo_timestamp:                   lat ? new Date() : null,
      status:                          'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Registration submitted. Awaiting admin approval.',
      member: { id: member.id, name: member.name, phone: member.phone, status: member.status },
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /auth/admin/login ───────────────────────────────────────────────────
router.post('/admin/login', [
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;
    const admin = await Admin.findOne({ where: { email, is_active: true } });

    // Return same message for not-found and wrong password — prevents user enumeration
    if (!admin || !(await admin.comparePassword(password))) {
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
      admin: admin.toJSON(),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
