const nodemailer = require('nodemailer')

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

// ── Create transporter using Gmail (free) ─────────────────────────────────────
// Setup: Go to Google Account → Security → App Passwords → Generate one
// Add to .env: EMAIL_USER=your@gmail.com  EMAIL_PASS=your_app_password
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,   // Gmail App Password (not your real password)
    },
  })
}

// ── Send emergency alert email ────────────────────────────────────────────────
const sendEmergencyEmail = async ({ to, residentName, flat, message, time }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('[Email] Skipped — EMAIL_USER/EMAIL_PASS not set in .env')
    return
  }

  const transporter = createTransporter()

  const html = `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px">
      <div style="background:#ef4444;color:white;padding:16px 20px;border-radius:12px 12px 0 0">
        <h2 style="margin:0;font-size:20px">🚨 Emergency Alert</h2>
        <p style="margin:4px 0 0;font-size:13px;opacity:0.85">Smart Society Management</p>
      </div>
      <div style="background:#fff;border:1px solid #fee2e2;border-top:none;padding:20px;border-radius:0 0 12px 12px">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;width:120px">Resident</td><td style="padding:8px 0;font-weight:600;color:#111">${residentName}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Flat / Unit</td><td style="padding:8px 0;font-weight:600;color:#111">${flat || 'N/A'}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Message</td><td style="padding:8px 0;font-weight:600;color:#dc2626">${message}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:13px">Time</td><td style="padding:8px 0;font-weight:600;color:#111">${time}</td></tr>
        </table>
        <div style="margin-top:16px;padding:12px;background:#fef2f2;border-radius:8px;font-size:13px;color:#dc2626">
          ⚠️ Please respond immediately and check on the resident.
        </div>
      </div>
    </div>
  `

  await transporter.sendMail({
    from:    `"Smart Society 🚨" <${process.env.EMAIL_USER}>`,
    to,
    subject: `🚨 Emergency Alert from ${residentName} (Flat ${flat || 'N/A'})`,
    html,
  })

  console.log(`[Email] Emergency alert sent to ${to}`)
}

// ── Send admin email to society members ───────────────────────────────────────
const sendAdminEmail = async ({ to, subject, message, senderName = 'Admin' }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('[Email] Skipped — EMAIL_USER/EMAIL_PASS not set in .env')
    return { skipped: true }
  }

  const safeSubject = escapeHtml(subject)
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br />')
  const safeSender = escapeHtml(senderName)

  const transporter = createTransporter()
  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:20px">
      <div style="background:#784add;color:white;padding:16px 20px;border-radius:12px 12px 0 0">
        <h2 style="margin:0;font-size:20px">${safeSubject}</h2>
        <p style="margin:4px 0 0;font-size:13px;opacity:0.85">Smart Society Management</p>
      </div>
      <div style="background:#fff;border:1px solid #edebfc;border-top:none;padding:20px;border-radius:0 0 12px 12px">
        <div style="font-size:14px;line-height:1.6;color:#2c185d">${safeMessage}</div>
        <div style="margin-top:18px;padding-top:12px;border-top:1px solid #edebfc;font-size:12px;color:#6b7280">
          Sent by ${safeSender}
        </div>
      </div>
    </div>
  `

  await transporter.sendMail({
    from: `"Smart Society" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  })

  console.log(`[Email] Admin email sent to ${to}`)
  return { sent: true }
}

module.exports = { sendEmergencyEmail, sendAdminEmail }
