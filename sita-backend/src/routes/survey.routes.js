'use strict';

const router = require('express').Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { createEntity, getEntities, submitConsumption, scanInvoice, uploadInvoicePhotos } = require('../controllers/surveyController');

// ─── Multer: Invoice photo uploads ────────────────────────────────────────────
const ALLOWED_IMAGE_MIMES = new Set(['image/jpeg', 'image/jpg', 'image/png']);
const MIME_TO_EXT = { 'image/jpeg': '.jpg', 'image/jpg': '.jpg', 'image/png': '.png' };

const invoiceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/invoices');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = MIME_TO_EXT[file.mimetype] || '.jpg';
    cb(null, `${uuidv4()}${ext}`);
  },
});

const invoiceUpload = multer({
  storage: invoiceStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_IMAGE_MIMES.has(file.mimetype)) {
      return cb(new Error('Only JPG, JPEG and PNG images are allowed'));
    }
    cb(null, true);
  },
});

const billPhotosUpload = multer({
  storage: invoiceStorage,
  limits: { fileSize: 10 * 1024 * 1024, files: 10 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_IMAGE_MIMES.has(file.mimetype)) {
      return cb(new Error('Only JPG, JPEG and PNG images are allowed'));
    }
    cb(null, true);
  },
});

// Agent auth middleware — validates the JWT issued by /auth/send-otp + /auth/verify-otp
const authenticateAgent = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }
  const token = authHeader.split(' ')[1];
  if (!token || token.split('.').length !== 3) {
    return res.status(401).json({ success: false, message: 'Invalid token format' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Token issued by verify-otp contains { mobile, phone, type: 'driver' }
    req.agent = { phone: decoded.phone || decoded.mobile };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired, please login again' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token format' });
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
                     'annual_quantity', 'unit', 'price_per_unit', 'invoice_photo_url',
                     'invoice_photos_urls', 'created_at']
      }],
      order: [['created_at', 'DESC']]
    });

    const data = entities.map(e => {
      const products = e.consumption_data || [];
      const photoUrl = products.find(p => p.invoice_photo_url)?.invoice_photo_url || null;
      const allPhotos = products.flatMap(p => p.invoice_photos_urls || []);
      const uniquePhotos = [...new Set(allPhotos)];
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
        invoice_photos_urls: uniquePhotos.length > 0 ? uniquePhotos : null,
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
router.post('/upload-invoice-photos', authenticateAgent, billPhotosUpload.array('photos', 10), uploadInvoicePhotos);
router.post('/entity', authenticateAgent, createEntity);
router.get('/entities', authenticateAgent, getEntities);
router.post('/consumption', authenticateAgent, submitConsumption);

module.exports = router;
