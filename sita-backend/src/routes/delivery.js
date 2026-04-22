'use strict';

const router = require('express').Router();
const { getOrders, confirmDelivery, reportDefect, cancelDelivery } = require('../controllers/deliveryController');
const { authenticateDriver } = require('../middleware/auth');

// All delivery routes require a valid driver JWT
router.get('/orders', authenticateDriver, getOrders);
router.post('/confirm', authenticateDriver, confirmDelivery);
router.post('/cancel', authenticateDriver, cancelDelivery);
router.post('/defect', authenticateDriver, reportDefect);

module.exports = router;
