'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { sanitizeInputs } = require('./middleware/sanitize');
const { errorHandler, notFound } = require('./middleware/error');
const authRoutes = require('./routes/auth');
const memberRoutes = require('./routes/members');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const deliveryRoutes = require('./routes/delivery');
const surveyRoutes = require('./routes/survey.routes');

const app = express();

// ─── Trust proxy (needed when behind Nginx / load balancer) ──────────────────
// Allows express-rate-limit to use the real client IP from X-Forwarded-For.
app.set('trust proxy', 1);

// ─── Helmet: HTTP security headers ───────────────────────────────────────────
app.use(helmet({
  // Content-Security-Policy: tightened for a JSON API (no HTML served)
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      scriptSrc:  ["'none'"],
      objectSrc:  ["'none'"],
      frameSrc:   ["'none'"],
    },
  },
  // Prevent MIME-type sniffing
  noSniff: true,
  // Disable DNS prefetch to avoid info leakage
  dnsPrefetchControl: { allow: false },
  // Remove X-Powered-By (Express) header
  hidePoweredBy: true,
  // HTTP Strict Transport Security: 1 year, include subdomains
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  // Prevent clickjacking
  frameguard: { action: 'deny' },
  // Referrer-Policy
  referrerPolicy: { policy: 'no-referrer' },
  // Cross-Origin Embedder / Opener / Resource policies
  crossOriginEmbedderPolicy: false, // keep false — mobile apps & Flutter break otherwise
}));

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Production origins come from ALLOWED_ORIGINS env var (comma-separated).
// Development falls back to any localhost port so Flutter, web devs, etc. work.
const prodOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const allowedOrigins = [
  // Explicit list — always respected regardless of NODE_ENV
  'https://sitafoundation.in',
  'https://www.sitafoundation.in',
  'https://admin.sitafoundation.in',
  'https://member.sitafoundation.in',
  ...prodOrigins,
  // Dev origins — used only when NODE_ENV === 'development'
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:5173',
  'http://localhost:5174',
];

app.use(cors({
  origin: (origin, callback) => {
    // No origin = mobile app, Postman, server-to-server → allow
    if (!origin) return callback(null, true);

    // In development: allow any localhost port (Flutter, React devtools, etc.)
    if (process.env.NODE_ENV === 'development' && /^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) return callback(null, true);

    // Log blocked origin so it's easy to diagnose without leaking to client
    console.warn(`[CORS] Blocked origin: ${origin}`);
    callback(Object.assign(new Error('Not allowed by CORS'), { status: 403 }));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // Cache preflight for 24 h
}));

// ─── Body parsing ─────────────────────────────────────────────────────────────
// Keep JSON body small — large payloads belong in file uploads (multipart)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ─── Input sanitization (runs after body parse, before any route) ─────────────
app.use(sanitizeInputs);

// ─── Rate limiters ────────────────────────────────────────────────────────────

// Global API limiter: 200 req / 15 min per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

// Auth route limiter: 20 req / 15 min per IP (brute-force guard on login)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts. Please wait 15 minutes.' },
});

// OTP send limiter: max 5 OTP requests per mobile number per hour.
// Keyed on the phone/mobile field in the body so each number gets its own bucket.
const otpSendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use the phone number as the rate-limit key (falls back to IP)
    const mobile = req.body?.phone || req.body?.mobile || req.ip;
    return `otp_send:${mobile}`;
  },
  skip: (req) => {
    // Don't count OTP_BYPASS requests against the limit in development
    return process.env.NODE_ENV === 'development' && req.body?.otp === process.env.OTP_BYPASS;
  },
  message: {
    success: false,
    message: 'Too many OTP requests for this number. Please wait 1 hour before trying again.',
  },
});

// OTP verify limiter: max 10 verify attempts per mobile per 15 min (prevents OTP brute-force)
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const mobile = req.body?.phone || req.body?.mobile || req.ip;
    return `otp_verify:${mobile}`;
  },
  message: {
    success: false,
    message: 'Too many OTP verification attempts. Please wait 15 minutes.',
  },
});

app.use('/api/v1', globalLimiter);

// ─── OTP per-mobile rate limiters ─────────────────────────────────────────────
// MUST be registered before authRoutes so they intercept requests first.
app.use('/api/v1/auth/member/send-otp', otpSendLimiter);
app.use('/api/v1/auth/send-otp',        otpSendLimiter);
app.use('/api/v1/auth/member/verify-otp', otpVerifyLimiter);
app.use('/api/v1/auth/verify-otp',        otpVerifyLimiter);

// ─── Static uploads — served with restrictive headers ─────────────────────────
// Files are served as downloads, not executed, preventing stored-XSS via uploads.
app.use('/uploads', (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Disposition', 'attachment');
  next();
}, express.static(path.join(__dirname, '../uploads')));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'SITA Foundation API', version: '1.0.0', timestamp: new Date() });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/members', memberRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/delivery', deliveryRoutes);
app.use('/api/v1/survey', surveyRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
