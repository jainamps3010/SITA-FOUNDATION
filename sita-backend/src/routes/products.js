'use strict';

const router = require('express').Router();
const { Op } = require('sequelize');
const { authenticateMember } = require('../middleware/auth');
const { Product, Vendor } = require('../models');
const { paginate, paginatedResponse } = require('../utils/helpers');

// GET /products - List approved & available products
router.get('/', authenticateMember, async (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query);
    const where = { approved: true, available: true };

    if (req.query.category) where.category = req.query.category;
    if (req.query.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${req.query.search}%` } },
        { description: { [Op.iLike]: `%${req.query.search}%` } }
      ];
    }
    if (req.query.min_price) where.price_per_unit = { ...(where.price_per_unit || {}), [Op.gte]: req.query.min_price };
    if (req.query.max_price) where.price_per_unit = { ...(where.price_per_unit || {}), [Op.lte]: req.query.max_price };

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{ model: Vendor, as: 'vendor', attributes: ['id', 'company_name', 'city', 'state', 'status'], where: { status: 'active' } }],
      order: [['created_at', 'DESC']],
      limit, offset
    });

    res.json({ success: true, ...paginatedResponse(rows, count, page, limit) });
  } catch (err) { next(err); }
});

// GET /products/:id
router.get('/:id', authenticateMember, async (req, res, next) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id, approved: true },
      include: [{ model: Vendor, as: 'vendor', attributes: ['id', 'company_name', 'city', 'state', 'phone', 'email'] }]
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (err) { next(err); }
});

module.exports = router;
