'use strict';

/**
 * Recursively sanitize a value:
 *  - Trims strings
 *  - Removes null bytes (common injection vector)
 *  - Strips HTML tags from non-HTML fields
 *  - Leaves numbers, booleans, null untouched
 */
function sanitizeValue(val) {
  if (typeof val === 'string') {
    return val
      .replace(/\0/g, '')          // null bytes
      .replace(/<[^>]*>/g, '')     // HTML tags
      .trim();
  }
  if (Array.isArray(val)) return val.map(sanitizeValue);
  if (val !== null && typeof val === 'object') return sanitizeObject(val);
  return val;
}

function sanitizeObject(obj) {
  const clean = {};
  for (const key of Object.keys(obj)) {
    // Drop keys that start with $ (NoSQL operator injection)
    if (key.startsWith('$')) continue;
    // Drop keys with dots (MongoDB path injection — harmless for Sequelize but belt-and-suspenders)
    if (key.includes('.')) continue;
    clean[key] = sanitizeValue(obj[key]);
  }
  return clean;
}

/**
 * Express middleware: sanitize req.body, req.query, req.params in place.
 * Applied globally before any route handler.
 */
function sanitizeInputs(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  next();
}

module.exports = { sanitizeInputs };
