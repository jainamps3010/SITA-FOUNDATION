'use strict';

require('dotenv').config();
const app = require('./src/app');
const { sequelize } = require('./src/models');
const { startMembershipExpiryJob } = require('./src/cron/membershipCron');

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    startMembershipExpiryJob();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`SITA Foundation server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
