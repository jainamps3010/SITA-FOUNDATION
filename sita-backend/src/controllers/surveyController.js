'use strict';

const fs = require('fs');
const { SurveyEntity, ConsumptionSurvey, SurveyAgent } = require('../models');
const { uploadFile } = require('../services/supabaseStorage');

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

    const agent = await SurveyAgent.findOne({ where: { mobile: req.agent.phone } });
    if (!agent || agent.status === 'pending') {
      return res.status(403).json({ success: false, message: 'Your account is pending approval. Please contact admin.' });
    }
    if (agent.status === 'blocked') {
      return res.status(403).json({ success: false, message: 'Your account has been blocked. Please contact SITA Foundation.' });
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
      where: { agent_id: req.agent.phone },
      attributes: [
        'id', 'agent_id', 'entity_name', 'owner_name', 'mobile',
        'entity_type', 'address', 'district', 'taluka', 'created_at'
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: entities });
  } catch (err) { next(err); }
};

// POST /api/v1/survey/scan-invoice
const scanInvoice = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Invoice image is required' });
    }
    const buffer = fs.readFileSync(req.file.path);
    const invoicePhotoUrl = await uploadFile(buffer, req.file.originalname, req.file.mimetype, 'invoices');
    fs.unlinkSync(req.file.path);

    // Dummy OCR data — replace with Google Vision API when ready
    res.json({
      success: true,
      invoice_photo_url: invoicePhotoUrl,
      extracted_data: {
        vendor_name: 'Mahavir Traders, Surat',
        invoice_date: '15/04/2026',
        products: [
          { name: 'Sunflower Oil', quantity: 50, unit: 'Liters', price: 95 },
          { name: 'Wheat Flour', quantity: 100, unit: 'Kg', price: 36 },
          { name: 'Sugar', quantity: 75, unit: 'Kg', price: 34 },
          { name: 'Toor Dal', quantity: 30, unit: 'Kg', price: 96 }
        ]
      }
    });
  } catch (err) { next(err); }
};

// POST /api/v1/survey/upload-invoice-photos
const uploadInvoicePhotos = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one photo is required' });
    }

    const urls = [];
    for (const file of req.files) {
      const buffer = fs.readFileSync(file.path);
      const url = await uploadFile(buffer, file.originalname, file.mimetype, 'invoices');
      fs.unlinkSync(file.path);
      urls.push(url);
    }

    res.json({ success: true, invoice_photos_urls: urls });
  } catch (err) { next(err); }
};

// POST /api/v1/survey/consumption
const submitConsumption = async (req, res, next) => {
  try {
    const { entity_id, products, invoice_photo_url, invoice_photos_urls } = req.body;

    if (!entity_id) {
      return res.status(400).json({ success: false, message: 'entity_id is required' });
    }
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, message: 'products must be a non-empty array' });
    }

    // Check agent approval status
    const agent = await SurveyAgent.findOne({ where: { mobile: req.agent.phone } });
    if (!agent || agent.status === 'pending') {
      return res.status(403).json({ success: false, message: 'Your account is pending approval. Please contact admin.' });
    }
    if (agent.status === 'blocked') {
      return res.status(403).json({ success: false, message: 'Your account has been blocked. Please contact SITA Foundation.' });
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

    const photoUrls = Array.isArray(invoice_photos_urls) && invoice_photos_urls.length > 0
      ? invoice_photos_urls
      : null;

    const rows = products.map((p) => ({
      entity_id,
      invoice_photo_url: invoice_photo_url || null,
      invoice_photos_urls: photoUrls,
      product_name: p.product_name,
      brand: p.brand || null,
      category: p.category,
      monthly_quantity: Number(p.monthly_quantity) || 0,
      annual_quantity: Number(p.annual_quantity) || (Number(p.monthly_quantity) || 0) * 12,
      unit: p.unit,
      price_per_unit: Number(p.price_per_unit) || 0
    }));

    const created = await ConsumptionSurvey.bulkCreate(rows);

    // Update agent's survey stats
    await agent.update({
      total_surveys: (agent.total_surveys || 0) + 1,
      last_survey_at: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Consumption data submitted successfully',
      data: { entity_id, products_saved: created.length }
    });
  } catch (err) { next(err); }
};

module.exports = { createEntity, getEntities, submitConsumption, scanInvoice, uploadInvoicePhotos };
