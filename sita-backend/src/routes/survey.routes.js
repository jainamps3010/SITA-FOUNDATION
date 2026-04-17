'use strict';

const router = require('express').Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { createEntity, getEntities, submitConsumption, scanInvoice } = require('../controllers/surveyController');

// ─── Multer: Invoice photo uploads ────────────────────────────────────────────
const invoiceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/invoices');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${uuidv4()}${ext}`);
  },
});
const invoiceUpload = multer({
  storage: invoiceStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\//i.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only images are allowed'));
  },
});

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

// GET /api/v1/survey/my-surveys — all surveys for logged-in agent
router.get('/my-surveys', authenticateAgent, async (req, res, next) => {
  try {
    const { SurveyEntity, ConsumptionSurvey } = require('../models');
    const entities = await SurveyEntity.findAll({
      where: { agent_id: req.agent.phone },
      include: [{
        model: ConsumptionSurvey,
        as: 'consumption_data',
        attributes: ['id', 'product_name', 'brand', 'category', 'monthly_quantity',
                     'annual_quantity', 'unit', 'price_per_unit', 'invoice_photo_url', 'created_at']
      }],
      order: [['created_at', 'DESC']]
    });

    const data = entities.map(e => {
      const products = e.consumption_data || [];
      const photoUrl = products.find(p => p.invoice_photo_url)?.invoice_photo_url || null;
      return {
        id: e.id,
        entity_name: e.entity_name,
        owner_name: e.owner_name,
        entity_type: e.entity_type,
        address: e.address,
        district: e.district,
        taluka: e.taluka,
        survey_date: e.created_at,
        products_count: products.length,
        invoice_photo_url: photoUrl,
        products
      };
    });

    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/dummy-invoice', authenticateAgent, (req, res) => {
  res.json({
    success: true,
    vendor_name: 'Mahavir Traders, Surat',
    invoice_date: '15/04/2026',
    products: [
      { name: 'Sunflower Oil', quantity: 50, unit: 'Liters', price: 95 },
      { name: 'Wheat Flour', quantity: 100, unit: 'Kg', price: 36 },
      { name: 'Sugar', quantity: 75, unit: 'Kg', price: 34 },
      { name: 'Toor Dal', quantity: 30, unit: 'Kg', price: 96 }
    ]
  });
});

router.post('/scan-invoice', authenticateAgent, invoiceUpload.single('invoice'), scanInvoice);
router.post('/entity', authenticateAgent, createEntity);
router.get('/entities', authenticateAgent, getEntities);
router.post('/consumption', authenticateAgent, submitConsumption);

module.exports = router;
