'use strict';

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateOrderNumber = () => {
  const prefix = 'SITA';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};

const generateDeliveryOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const calculateSplit = (amount) => {
  const commissionPercent = parseFloat(process.env.SITA_COMMISSION_PERCENT) || 2;
  const sita_commission = parseFloat((amount * commissionPercent / 100).toFixed(2));
  const vendor_amount = parseFloat((amount - sita_commission).toFixed(2));
  return { sita_commission, vendor_amount };
};

const paginate = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 20, 100);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

const paginatedResponse = (data, count, page, limit) => ({
  data,
  pagination: {
    total: count,
    page,
    limit,
    pages: Math.ceil(count / limit)
  }
});

module.exports = {
  generateOTP,
  generateOrderNumber,
  generateDeliveryOTP,
  calculateSplit,
  paginate,
  paginatedResponse
};
