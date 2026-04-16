'use strict';

const router = require('express').Router();
const { getOrders, confirmDelivery, reportDefect, cancelDelivery } = require('../controllers/deliveryController');

// GET  /api/v1/delivery/orders  - list dispatched orders for delivery app
router.get('/orders', getOrders);

// POST /api/v1/delivery/confirm - verify OTP and mark order as delivered
router.post('/confirm', confirmDelivery);

// POST /api/v1/delivery/cancel  - cancel a dispatched delivery (revert to pending)
router.post('/cancel', cancelDelivery);

// POST /api/v1/delivery/defect  - report a defect / raise a dispute
router.post('/defect', reportDefect);

module.exports = router;
