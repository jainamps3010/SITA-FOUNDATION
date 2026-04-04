'use strict';

const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { Order, Member } = require('../models');

// POST /delivery/verify-otp
// Called by delivery person to confirm delivery
// In production this would have delivery agent authentication
router.post('/verify-otp', [
  body('order_id').isUUID().withMessage('Valid order ID required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('6-digit OTP required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { order_id, otp } = req.body;
    const order = await Order.findByPk(order_id, {
      include: [{ model: Member, as: 'member', attributes: ['id', 'name', 'hotel_name'] }]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!['confirmed', 'dispatched'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot verify OTP for order with status: ${order.status}`
      });
    }

    if (order.delivery_otp_verified) {
      return res.status(400).json({ success: false, message: 'Delivery already confirmed for this order' });
    }

    if (order.delivery_otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid delivery OTP' });
    }

    await order.update({
      delivery_otp_verified: true,
      status: 'delivered',
      delivered_at: new Date()
    });

    res.json({
      success: true,
      message: 'Delivery confirmed successfully',
      order: {
        id: order.id,
        order_number: order.order_number,
        status: 'delivered',
        delivered_at: order.delivered_at,
        member: order.member
      }
    });
  } catch (err) { next(err); }
});

// GET /delivery/order/:order_number - Get order details for delivery (by order number)
router.get('/order/:order_number', async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: { order_number: req.params.order_number },
      include: [
        { model: Member, as: 'member', attributes: ['id', 'name', 'hotel_name', 'hotel_address', 'phone'] }
      ],
      attributes: ['id', 'order_number', 'status', 'delivery_address', 'delivery_otp_verified', 'total_amount', 'created_at']
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (err) { next(err); }
});

module.exports = router;
