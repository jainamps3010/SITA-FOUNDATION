'use strict';

const cron = require('node-cron');
const { Op } = require('sequelize');
const { Member } = require('../models');
const { sendMembershipExpiryReminderEmail } = require('../services/emailService');

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

  // Send 30-day expiry reminder emails at 09:00 IST each day
  cron.schedule('0 9 * * *', async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Target members expiring in exactly 30 days (today + 30)
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + 30);
      const targetStr  = targetDate.toISOString().split('T')[0];
      const nextDayStr = new Date(targetDate.getTime() + 86400000).toISOString().split('T')[0];

      const members = await Member.findAll({
        where: {
          membership_status: 'active',
          email: { [Op.ne]: null },
          membership_expiry_date: { [Op.gte]: targetStr, [Op.lt]: nextDayStr }
        }
      });

      for (const member of members) {
        await sendMembershipExpiryReminderEmail(member);
      }

      if (members.length > 0) {
        console.log(`[MembershipCron] Expiry reminder sent to ${members.length} member(s) expiring on ${targetStr}`);
      }
    } catch (err) {
      console.error('[MembershipCron] Error sending expiry reminders:', err.message);
    }
  }, { timezone: 'Asia/Kolkata' });

  console.log('[MembershipCron] Expiry reminder job scheduled (09:00 IST daily)');
};

module.exports = { startMembershipExpiryJob };
