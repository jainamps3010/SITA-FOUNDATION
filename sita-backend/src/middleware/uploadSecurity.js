'use strict';

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/pdf',
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.pdf']);

/**
 * Build a secure multer instance for a given upload destination.
 * Enforces:
 *  - MIME type allowlist
 *  - Extension allowlist (double-checks against MIME spoofing)
 *  - 10 MB per-file size limit
 *  - UUID-randomised filenames (prevents path traversal)
 */
function createSecureUpload(destSubdir) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, '../../uploads', destSubdir);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      // Only allow whitelisted extensions — ignore whatever the client claims
      if (!ALLOWED_EXTENSIONS.has(ext)) {
        return cb(new Error(`File type not allowed: ${ext}`));
      }
      cb(null, `${uuidv4()}${ext}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(file.mimetype) || !ALLOWED_EXTENSIONS.has(ext)) {
      return cb(Object.assign(new Error('Only JPG, JPEG, PNG and PDF files are allowed'), { status: 400 }));
    }
    cb(null, true);
  };

  return multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE, files: 10 },
    fileFilter,
  });
}

module.exports = { createSecureUpload, MAX_FILE_SIZE, ALLOWED_EXTENSIONS };
