'use strict';

const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { createEntity, getEntities, submitConsumption } = require('../controllers/surveyController');

// Agent auth middleware — validates the JWT issued by /auth/send-otp + /auth/verify-otp
const authenticateAgent = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Token issued by verify-otp contains { mobile, phone, type: 'driver' }
    req.agent = { phone: decoded.phone || decoded.mobile };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

router.post('/entity', authenticateAgent, createEntity);
router.get('/entities', authenticateAgent, getEntities);
router.post('/consumption', authenticateAgent, submitConsumption);

module.exports = router;
