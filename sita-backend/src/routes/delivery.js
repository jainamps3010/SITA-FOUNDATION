'use strict';

const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const router = require('express').Router();
const { getOrders, confirmDelivery, reportDefect, cancelDelivery, uploadDeliveryPhoto } = require('../controllers/deliveryController');
const { authenticateDriver } = require('../middleware/auth');

const ALLOWED_IMAGE_MIMES = new Set(['image/jpeg', 'image/jpg', 'image/png']);
const MIME_TO_EXT = { 'image/jpeg': '.jpg', 'image/jpg': '.jpg', 'image/png': '.png' };

const photoUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, '../../uploads/delivery');
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = MIME_TO_EXT[file.mimetype] || '.jpg';
      cb(null, `${uuidv4()}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_IMAGE_MIMES.has(file.mimetype)) {
      return cb(new Error('Only JPG, JPEG and PNG images are allowed'));
    }
    cb(null, true);
  },
});

// All delivery routes require a valid driver JWT
router.get('/orders', authenticateDriver, getOrders);
router.post('/confirm', authenticateDriver, confirmDelivery);
router.post('/cancel', authenticateDriver, cancelDelivery);
router.post('/defect', authenticateDriver, reportDefect);
router.post('/upload-photo', authenticateDriver, photoUpload.single('photo'), uploadDeliveryPhoto);

module.exports = router;
