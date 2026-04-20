'use strict';

const twilio = require('twilio');

const accountSid  = process.env.TWILIO_ACCOUNT_SID;
const authToken   = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Log what values are being picked up from .env (token masked for security)
console.log('Twilio SID:   ', accountSid   ? accountSid.substring(0, 10) + '...'  : 'MISSING');
console.log('Twilio Token: ', authToken    ? authToken.substring(0, 4)   + '****' : 'MISSING');
console.log('Twilio From:  ', phoneNumber  || 'MISSING');

if (!accountSid || !authToken || !phoneNumber) {
  throw new Error(
    'Twilio credentials missing. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env'
  );
}

const client = twilio(accountSid, authToken);

module.exports = { client, phoneNumber };
