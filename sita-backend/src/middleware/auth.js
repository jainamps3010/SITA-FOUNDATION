'use strict';

const jwt = require('jsonwebtoken');
const { Member, Admin } = require('../models');

const authenticateMember = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access token required' });
    }

    const token = authHeader.split(' ')[1];
    if (!token || token.split('.').length !== 3) {
      return res.status(401).json({ success: false, message: 'Invalid token format' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const member = await Member.findByPk(decoded.id);
    if (!member) {
      return res.status(401).json({ success: false, message: 'Member not found' });
    }
    if (member.status === 'suspended' || member.status === 'rejected') {
      return res.status(403).json({ success: false, message: 'Account is not active' });
    }

    req.member = member;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired, please login again' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token format' });
    }
    next(err);
  }
};

const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Admin access token required' });
    }

    const token = authHeader.split(' ')[1];
    if (!token || token.split('.').length !== 3) {
      return res.status(401).json({ success: false, message: 'Invalid token format' });
    }

    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET);

    const admin = await Admin.findByPk(decoded.id);
    if (!admin || !admin.is_active) {
      return res.status(401).json({ success: false, message: 'Admin not found or inactive' });
    }

    req.admin = admin;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired, please login again' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token format' });
    }
    next(err);
  }
};

const requireMembership = (req, res, next) => {
  if (!req.member.membership_paid) {
    return res.status(403).json({
      success: false,
      message: 'Active membership required to place orders. Please pay the annual membership fee.',
      code: 'MEMBERSHIP_REQUIRED'
    });
  }
  const ms = req.member.membership_status;
  if (ms === 'expired') {
    return res.status(403).json({
      success: false,
      message: 'Your annual membership has expired. Please renew to continue ordering.',
      code: 'MEMBERSHIP_EXPIRED'
    });
  }
  if (ms === 'cancelled') {
    return res.status(403).json({
      success: false,
      message: 'Your membership has been cancelled. Please contact support.',
      code: 'MEMBERSHIP_CANCELLED'
    });
  }
  if (req.member.status !== 'active') {
    return res.status(403).json({
      success: false,
      message: 'Your account must be approved before placing orders.',
      code: 'ACCOUNT_NOT_ACTIVE'
    });
  }
  next();
};

const authenticateDriver = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Driver access token required' });
    }
    const token = authHeader.split(' ')[1];
    if (!token || token.split('.').length !== 3) {
      return res.status(401).json({ success: false, message: 'Invalid token format' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'driver') {
      return res.status(403).json({ success: false, message: 'Driver token required' });
    }
    req.driver = { mobile: decoded.mobile || decoded.phone, phone: decoded.mobile || decoded.phone };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired, please login again' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token format' });
    }
    next(err);
  }
};

module.exports = { authenticateMember, authenticateAdmin, requireMembership, authenticateDriver };
