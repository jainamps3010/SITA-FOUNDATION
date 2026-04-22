'use strict';

const nodemailer = require('nodemailer');

const CONTACT = {
  email: 'chairman@sita.foundation',
  phone1: '7069924365',
  phone2: '7069824365',
};

const BANK = {
  bank:        'THE SURAT DISTRICT CO-OPERATIVE BANK LTD.',
  accountName: 'SANTANI IDEAL TAG AGRO FOUNDATION',
  accountNo:   '007712103002069',
  ifsc:        'SDCB0000077',
};

let _transporter = null;

function getTransporter() {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });
  }
  return _transporter;
}

// ─── Base layout ──────────────────────────────────────────────────────────────

function layout(bodyHtml) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.10); }
    .header  { background: #1A237E; padding: 24px 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 0.5px; }
    .header p  { color: #b0bec5; margin: 4px 0 0; font-size: 13px; }
    .body    { padding: 28px 32px; color: #374151; font-size: 15px; line-height: 1.6; }
    .body h2 { color: #1A237E; margin-top: 0; }
    .info-box { background: #f0f4ff; border-left: 4px solid #1A237E; border-radius: 4px; padding: 14px 18px; margin: 18px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #6b7280; font-weight: 600; }
    .info-value { color: #111827; font-weight: 500; }
    .bank-box { background: #fafafa; border: 1px solid #e5e7eb; border-radius: 6px; padding: 14px 18px; margin: 18px 0; font-size: 14px; }
    .bank-box h4 { margin: 0 0 10px; color: #1A237E; font-size: 14px; }
    .footer  { background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 18px 32px; text-align: center; color: #9ca3af; font-size: 12px; }
    .footer a { color: #1A237E; text-decoration: none; }
    .btn     { display: inline-block; background: #1A237E; color: #ffffff !important; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 12px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>SITA Foundation</h1>
      <p>Santani Ideal Tag Agro Foundation</p>
    </div>
    <div class="body">
      ${bodyHtml}
    </div>
    <div class="footer">
      <p>Questions? Contact us at <a href="mailto:${CONTACT.email}">${CONTACT.email}</a></p>
      <p>📞 ${CONTACT.phone1} &nbsp;|&nbsp; ${CONTACT.phone2}</p>
      <p style="margin-top:8px;color:#d1d5db;">© ${new Date().getFullYear()} SITA Foundation. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

// ─── Core send helper ─────────────────────────────────────────────────────────

async function sendEmail(to, subject, html) {
  if (!to) return;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.log(`[Email] Skipped (EMAIL_USER not configured) → ${to}: ${subject}`);
    return;
  }
  try {
    await getTransporter().sendMail({
      from: `"SITA Foundation" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email] Sent to ${to}: ${subject}`);
  } catch (err) {
    console.error(`[Email] Failed to send to ${to}:`, err.message);
  }
}

// ─── 1. Member Approval ───────────────────────────────────────────────────────

async function sendMemberApprovalEmail(member) {
  if (!member.email) return;
  const html = layout(`
    <h2>🎉 Welcome to SITA Foundation!</h2>
    <p>Dear <strong>${member.name}</strong>,</p>
    <p>We are delighted to inform you that your account has been <strong style="color:#059669;">approved!</strong> You are now a registered member of SITA Foundation.</p>

    <div class="info-box">
      <div class="info-row"><span class="info-label">Name</span><span class="info-value">${member.name}</span></div>
      <div class="info-row"><span class="info-label">Business</span><span class="info-value">${member.hotel_name}</span></div>
      <div class="info-row"><span class="info-label">Mobile</span><span class="info-value">${member.phone}</span></div>
    </div>

    <h3 style="color:#1A237E;font-size:15px;">Next Steps</h3>
    <ol style="color:#4b5563;padding-left:20px;">
      <li>Pay your annual membership fee of <strong>₹5,000</strong> to activate ordering privileges.</li>
      <li>Log in to the SITA Member App using your registered mobile number.</li>
      <li>Browse products from our verified vendors and start ordering!</li>
    </ol>

    <h3 style="color:#1A237E;font-size:15px;">Bank Transfer Details for Membership Fee</h3>
    <div class="bank-box">
      <h4>💳 Payment Details</h4>
      <div class="info-row"><span class="info-label">Bank</span><span class="info-value">${BANK.bank}</span></div>
      <div class="info-row"><span class="info-label">Account Name</span><span class="info-value">${BANK.accountName}</span></div>
      <div class="info-row"><span class="info-label">Account No</span><span class="info-value"><strong>${BANK.accountNo}</strong></span></div>
      <div class="info-row"><span class="info-label">IFSC Code</span><span class="info-value">${BANK.ifsc}</span></div>
    </div>

    <p style="color:#6b7280;font-size:13px;">After payment, submit your UTR / transaction ID in the app. Your membership will be activated within 24 hours of verification.</p>
  `);
  await sendEmail(member.email, 'Welcome to SITA Foundation — Account Approved! 🎉', html);
}

// ─── 2. Member Rejection ──────────────────────────────────────────────────────

async function sendMemberRejectionEmail(member, reason) {
  if (!member.email) return;
  const html = layout(`
    <h2>Application Status Update</h2>
    <p>Dear <strong>${member.name}</strong>,</p>
    <p>Thank you for applying to SITA Foundation. After reviewing your application, we regret to inform you that we are unable to approve your account at this time.</p>

    <div class="info-box" style="background:#fff5f5;border-left-color:#dc2626;">
      <strong style="color:#dc2626;">Reason for rejection:</strong>
      <p style="margin:6px 0 0;color:#374151;">${reason || 'Please contact us for details.'}</p>
    </div>

    <h3 style="color:#1A237E;font-size:15px;">How to Reapply</h3>
    <p>You are welcome to reapply after addressing the issues mentioned above. Please ensure all required documents are valid and up to date before submitting a new application.</p>

    <p>If you believe this is an error or need clarification, please reach out to us:</p>
    <ul style="color:#4b5563;">
      <li>Email: <a href="mailto:${CONTACT.email}">${CONTACT.email}</a></li>
      <li>Phone: ${CONTACT.phone1} / ${CONTACT.phone2}</li>
    </ul>
  `);
  await sendEmail(member.email, 'SITA Foundation — Application Status Update', html);
}

// ─── 3. Payment Verified / Membership Activated ───────────────────────────────

async function sendPaymentVerifiedEmail(member) {
  if (!member.email) return;
  const startDate  = member.membership_start_date  ? new Date(member.membership_start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
  const expiryDate = member.membership_expiry_date ? new Date(member.membership_expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

  const html = layout(`
    <h2>✅ Membership Activated!</h2>
    <p>Dear <strong>${member.name}</strong>,</p>
    <p>Your payment has been verified and your <strong>annual membership is now active</strong>. You can now place orders on the SITA Foundation platform.</p>

    <div class="info-box">
      <div class="info-row"><span class="info-label">Member Name</span><span class="info-value">${member.name}</span></div>
      <div class="info-row"><span class="info-label">Business</span><span class="info-value">${member.hotel_name}</span></div>
      <div class="info-row"><span class="info-label">Membership Start</span><span class="info-value">${startDate}</span></div>
      <div class="info-row"><span class="info-label">Membership Expiry</span><span class="info-value"><strong>${expiryDate}</strong></span></div>
      <div class="info-row"><span class="info-label">Membership Fee</span><span class="info-value">₹${member.membership_fee || 5000}</span></div>
    </div>

    <p>Welcome to the SITA Foundation family! You can now browse products from our verified vendors and enjoy exclusive pricing.</p>

    <p style="color:#6b7280;font-size:13px;">⚠️ Note: The membership fee is non-refundable. Please renew your membership before the expiry date to continue enjoying uninterrupted service.</p>
  `);
  await sendEmail(member.email, 'SITA Foundation — Membership Activated! ✅', html);
}

// ─── 4. Order Confirmation ────────────────────────────────────────────────────

async function sendOrderConfirmationEmail(member, order) {
  if (!member.email) return;

  const itemRows = (order.items || []).map(item => `
    <div class="info-row">
      <span class="info-label">${item.product_name || item.name}</span>
      <span class="info-value">${item.quantity} ${item.product_unit || ''} × ₹${parseFloat(item.unit_price).toFixed(2)} = <strong>₹${parseFloat(item.total_price).toFixed(2)}</strong></span>
    </div>
  `).join('');

  const html = layout(`
    <h2>📦 Order Confirmed!</h2>
    <p>Dear <strong>${member.name}</strong>,</p>
    <p>Your order has been successfully placed. We will notify you once it is dispatched.</p>

    <div class="info-box">
      <div class="info-row"><span class="info-label">Order ID</span><span class="info-value"><strong>${order.order_number}</strong></span></div>
      <div class="info-row"><span class="info-label">Payment Method</span><span class="info-value">${(order.payment_method || '').replace(/_/g, ' ').toUpperCase()}</span></div>
      <div class="info-row"><span class="info-label">Delivery Address</span><span class="info-value">${order.delivery_address || member.hotel_address || '—'}</span></div>
    </div>

    <h3 style="color:#1A237E;font-size:15px;">Items Ordered</h3>
    <div class="info-box">
      ${itemRows || '<div style="color:#6b7280;font-size:14px;">No items</div>'}
      <div class="info-row" style="margin-top:8px;">
        <span class="info-label" style="font-size:15px;">Total Amount</span>
        <span class="info-value" style="font-size:16px;color:#1A237E;"><strong>₹${parseFloat(order.total_amount).toFixed(2)}</strong></span>
      </div>
    </div>

    <p style="color:#6b7280;font-size:13px;">You will receive a delivery OTP on your registered mobile when the order is out for delivery. Please share it only with the delivery partner at the time of delivery.</p>
  `);
  await sendEmail(member.email, `Order Confirmed — ${order.order_number} | SITA Foundation`, html);
}

// ─── 5. Membership Expiry Reminder ───────────────────────────────────────────

async function sendMembershipExpiryReminderEmail(member) {
  if (!member.email) return;
  const expiryDate = member.membership_expiry_date
    ? new Date(member.membership_expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  const html = layout(`
    <h2>⏰ Your Membership Expires in 30 Days</h2>
    <p>Dear <strong>${member.name}</strong>,</p>
    <p>This is a friendly reminder that your SITA Foundation annual membership is expiring on <strong>${expiryDate}</strong>. Please renew it to continue enjoying uninterrupted access to our platform.</p>

    <div class="info-box">
      <div class="info-row"><span class="info-label">Member Name</span><span class="info-value">${member.name}</span></div>
      <div class="info-row"><span class="info-label">Business</span><span class="info-value">${member.hotel_name}</span></div>
      <div class="info-row"><span class="info-label">Expiry Date</span><span class="info-value"><strong style="color:#dc2626;">${expiryDate}</strong></span></div>
      <div class="info-row"><span class="info-label">Renewal Fee</span><span class="info-value">₹5,000</span></div>
    </div>

    <h3 style="color:#1A237E;font-size:15px;">How to Renew</h3>
    <ol style="color:#4b5563;padding-left:20px;">
      <li>Transfer ₹5,000 to the bank account below.</li>
      <li>Open the SITA Member App and submit your UTR / transaction ID.</li>
      <li>Your membership will be renewed within 24 hours.</li>
    </ol>

    <div class="bank-box">
      <h4>💳 Bank Transfer Details</h4>
      <div class="info-row"><span class="info-label">Bank</span><span class="info-value">${BANK.bank}</span></div>
      <div class="info-row"><span class="info-label">Account Name</span><span class="info-value">${BANK.accountName}</span></div>
      <div class="info-row"><span class="info-label">Account No</span><span class="info-value"><strong>${BANK.accountNo}</strong></span></div>
      <div class="info-row"><span class="info-label">IFSC Code</span><span class="info-value">${BANK.ifsc}</span></div>
    </div>

    <p>Need help? Contact us:<br>
    📧 <a href="mailto:${CONTACT.email}">${CONTACT.email}</a><br>
    📞 ${CONTACT.phone1} / ${CONTACT.phone2}</p>
  `);
  await sendEmail(member.email, `Action Required: SITA Foundation Membership Expiring on ${expiryDate}`, html);
}

module.exports = {
  sendMemberApprovalEmail,
  sendMemberRejectionEmail,
  sendPaymentVerifiedEmail,
  sendOrderConfirmationEmail,
  sendMembershipExpiryReminderEmail,
};
