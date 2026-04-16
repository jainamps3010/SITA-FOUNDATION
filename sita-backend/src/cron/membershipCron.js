'use strict';

const cron = require('node-cron');
const { Op } = require('sequelize');
const { Member } = require('../models');

/**
 * Runs daily at midnight (00:00).
 * Finds all members whose membership_expiry_date has passed and
 * membership_status is still 'active', then marks them as 'expired'.
 */
const startMembershipExpiryJob = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const [count] = await Member.update(
        { membership_status: 'expired' },
        {
          where: {
            membership_status: 'active',
            membership_expiry_date: { [Op.lt]: today }
          }
        }
      );
      if (count > 0) {
        console.log(`[MembershipCron] ${count} membership(s) marked as expired on ${today}`);
      }
    } catch (err) {
      console.error('[MembershipCron] Error running expiry check:', err.message);
    }
  }, { timezone: 'Asia/Kolkata' });

  console.log('[MembershipCron] Daily expiry job scheduled (00:00 IST)');
};

module.exports = { startMembershipExpiryJob };
