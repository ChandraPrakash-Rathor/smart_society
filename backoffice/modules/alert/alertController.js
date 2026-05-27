const Alert              = require('./Alert')
const Notification       = require('../notification/Notification')
const User               = require('../user/User')
const { sendEmergencyEmail } = require('../../utils/emailService')

// @desc   Send emergency alert — notifies all guards + admins (in-app + email)
// @route  POST /api/alerts
// @access Resident
const sendAlert = async (req, res) => {
  try {
    const { message, flat } = req.body

    // 1. Save alert record
    const alert = await Alert.create({
      sentBy:  req.user._id,
      message: message || 'Emergency! Immediate assistance required.',
      flat:    flat || req.user.flat,
    })

    // 2. Find all guards and admins
    const recipients = await User.find({
      role: { $in: ['guard', 'admin'] },
    }).select('_id name email')

    // 3. In-app notifications
    const notifications = recipients.map(r => ({
      title:     '🚨 Emergency Alert',
      message:   `${req.user.name} (Flat ${flat || req.user.flat || 'N/A'}) sent an emergency alert: ${alert.message}`,
      type:      'alert',
      recipient: r._id,
    }))
    await Notification.insertMany(notifications)

    // 4. Send email to all admins + ADMIN_EMAIL env (fire and forget — don't block response)
    const alertTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    const emailPayload = {
      residentName: req.user.name,
      flat:         flat || req.user.flat || 'N/A',
      message:      alert.message,
      time:         alertTime,
    }

    // Email to all admins in DB
    const adminEmails = recipients
      .filter(r => r.email)
      .map(r => r.email)

    // Also email the ADMIN_EMAIL from .env if set
    if (process.env.ADMIN_EMAIL) adminEmails.push(process.env.ADMIN_EMAIL)

    const uniqueEmails = [...new Set(adminEmails)]

    // Send emails in background (don't await — respond fast)
    Promise.allSettled(
      uniqueEmails.map(to => sendEmergencyEmail({ to, ...emailPayload }))
    ).then(results => {
      results.forEach((r, i) => {
        if (r.status === 'rejected') console.error(`[Email] Failed to ${uniqueEmails[i]}:`, r.reason?.message)
      })
    })

    res.status(201).json({
      message:  'Alert sent to all guards and admins',
      alert,
      notified: recipients.length,
      emailed:  uniqueEmails.length,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc   Get all alerts (admin view)
// @route  GET /api/alerts
// @access Admin
const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find()
      .populate('sentBy', 'name email flat')
      .sort({ createdAt: -1 })
    res.json(alerts)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc   Resolve alert
// @route  PATCH /api/alerts/:id/resolve
// @access Admin, Guard
const resolveAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { resolved: true },
      { new: true }
    )
    if (!alert) return res.status(404).json({ message: 'Alert not found' })
    res.json(alert)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { sendAlert, getAlerts, resolveAlert }
