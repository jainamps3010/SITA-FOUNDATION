'use strict';

const { SurveyEntity, ConsumptionSurvey } = require('../models');

// POST /api/v1/survey/entity
const createEntity = async (req, res, next) => {
  try {
    const { entity_name, owner_name, mobile, entity_type, address, district, taluka } = req.body;

    if (!entity_name || !owner_name || !mobile || !entity_type || !address || !district || !taluka) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: entity_name, owner_name, mobile, entity_type, address, district, taluka'
      });
    }

    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ success: false, message: 'mobile must be a 10-digit number' });
    }

    const entity = await SurveyEntity.create({
      agent_id: req.agent.phone,
      entity_name,
      owner_name,
      mobile,
      entity_type,
      address,
      district,
      taluka
    });

    res.status(201).json({
      success: true,
      message: 'Entity created successfully',
      data: { id: entity.id, entity_name: entity.entity_name }
    });
  } catch (err) { next(err); }
};

// GET /api/v1/survey/entities
const getEntities = async (req, res, next) => {
  try {
    const entities = await SurveyEntity.findAll({
      attributes: [
        'id', 'agent_id', 'entity_name', 'owner_name', 'mobile',
        'entity_type', 'address', 'district', 'taluka', 'created_at'
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: entities });
  } catch (err) { next(err); }
};

// POST /api/v1/survey/consumption
const submitConsumption = async (req, res, next) => {
  try {
    const { entity_id, products } = req.body;

    if (!entity_id) {
      return res.status(400).json({ success: false, message: 'entity_id is required' });
    }
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, message: 'products must be a non-empty array' });
    }

    const entity = await SurveyEntity.findByPk(entity_id);
    if (!entity) {
      return res.status(404).json({ success: false, message: 'Entity not found' });
    }

    for (const [i, p] of products.entries()) {
      if (!p.product_name || !p.category || !p.unit) {
        return res.status(400).json({
          success: false,
          message: `Product at index ${i} missing required fields: product_name, category, unit`
        });
      }
    }

    const rows = products.map((p) => ({
      entity_id,
      product_name: p.product_name,
      brand: p.brand || null,
      category: p.category,
      monthly_quantity: Number(p.monthly_quantity) || 0,
      annual_quantity: Number(p.annual_quantity) || (Number(p.monthly_quantity) || 0) * 12,
      unit: p.unit,
      price_per_unit: Number(p.price_per_unit) || 0
    }));

    const created = await ConsumptionSurvey.bulkCreate(rows);

    res.status(201).json({
      success: true,
      message: 'Consumption data submitted successfully',
      data: { entity_id, products_saved: created.length }
    });
  } catch (err) { next(err); }
};

module.exports = { createEntity, getEntities, submitConsumption };
