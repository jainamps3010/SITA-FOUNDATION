'use strict';

const { Order, OrderItem, Member, Dispute } = require('../models');

// GET /api/v1/delivery/orders
// Returns all orders with status "dispatched"
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      where: { status: 'dispatched' },
      include: [
        {
          model: Member,
          as: 'member',
          attributes: ['id', 'name', 'hotel_name', 'hotel_address', 'phone']
        },
        {
          model: OrderItem,
          as: 'items',
          attributes: ['id', 'product_name', 'product_unit', 'quantity', 'unit_price', 'total_price']
        }
      ],
      attributes: [
        'id', 'order_number', 'status', 'delivery_address',
        'total_amount', 'payment_method', 'expected_delivery_date', 'created_at'
      ],
      order: [['created_at', 'DESC']]
    });

    const formatted = orders.map(o => ({
      id: o.id,
      order_number: o.order_number,
      status: o.status,
      delivery_address: o.delivery_address || o.member?.hotel_address || '',
      total_amount: o.total_amount,
      payment_method: o.payment_method,
      expected_delivery_date: o.expected_delivery_date,
      member_name: o.member?.name || '',
      hotel_name: o.member?.hotel_name || '',
      member_phone: o.member?.phone || '',
      items: o.items || []
    }));

    res.json(formatted);
  } catch (err) { next(err); }
};

// POST /api/v1/delivery/confirm
// Body: { order_id, otp }
const confirmDelivery = async (req, res, next) => {
  try {
    const { order_id, otp } = req.body;

    if (!order_id || !otp) {
      return res.status(400).json({ success: false, message: 'order_id and otp are required' });
    }

    const order = await Order.findByPk(order_id, {
      include: [{ model: Member, as: 'member', attributes: ['id', 'name'] }]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'dispatched') {
      return res.status(400).json({
        success: false,
        message: `Cannot confirm order with status: ${order.status}`
      });
    }

    if (order.delivery_otp_verified) {
      return res.status(400).json({ success: false, message: 'Delivery already confirmed' });
    }

    if (order.delivery_otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    await order.update({
      status: 'delivered',
      delivery_otp_verified: true,
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
};

// POST /api/v1/delivery/defect
// Body: { order_id, description, photo_url }
const reportDefect = async (req, res, next) => {
  try {
    const { order_id, description, photo_url } = req.body;

    if (!order_id || !description) {
      return res.status(400).json({ success: false, message: 'order_id and description are required' });
    }

    const order = await Order.findByPk(order_id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const fullDescription = photo_url
      ? `${description}\nPhoto: ${photo_url}`
      : description;

    const dispute = await Dispute.create({
      order_id: order.id,
      member_id: order.member_id,
      vendor_id: order.vendor_id,
      reason: 'other',
      description: fullDescription,
      status: 'open'
    });

    await order.update({ status: 'disputed' });

    res.status(201).json({
      success: true,
      message: 'Defect reported successfully',
      dispute: {
        id: dispute.id,
        order_id: dispute.order_id,
        reason: dispute.reason,
        status: dispute.status
      }
    });
  } catch (err) { next(err); }
};

// POST /api/v1/delivery/cancel
// Body: { order_id }
const cancelDelivery = async (req, res, next) => {
  try {
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({ success: false, message: 'order_id is required' });
    }

    const order = await Order.findByPk(order_id, {
      include: [{ model: Member, as: 'member', attributes: ['id', 'name'] }]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'dispatched') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`
      });
    }

    await order.update({
      status: 'pending',
      cancellation_reason: 'Cancelled by delivery partner'
    });

    // Notify admin
    console.log(`[ADMIN NOTIFY] Order ${order.order_number} was cancelled by delivery partner and reverted to pending.`);

    res.json({
      success: true,
      message: 'Delivery cancelled. Order returned to pending.',
      order: {
        id: order.id,
        order_number: order.order_number,
        status: 'pending',
        member: order.member
      }
    });
  } catch (err) { next(err); }
};

module.exports = { getOrders, confirmDelivery, reportDefect, cancelDelivery };
