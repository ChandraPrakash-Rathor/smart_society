const Announcement = require('./Announcement')
const Notification = require('../notification/Notification')
const User = require('../user/User')
const { sendAdminEmail } = require('../../utils/emailService')

// @desc   Get all announcements (residents + guards see these)
// @route  GET /api/announcements
// @access All roles
const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('postedBy', 'name')
      .sort({ pinned: -1, createdAt: -1 })  // pinned first, then newest
    res.json(announcements)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc   Create announcement
// @route  POST /api/announcements
// @access Admin
const createAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.create({
      ...req.body,
      postedBy: req.user._id,
    })
    await announcement.populate('postedBy', 'name')
    res.status(201).json(announcement)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// @desc   Update announcement
// @route  PUT /api/announcements/:id
// @access Admin
const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    ).populate('postedBy', 'name')
    if (!announcement) return res.status(404).json({ message: 'Not found' })
    res.json(announcement)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// @desc   Delete announcement
// @route  DELETE /api/announcements/:id
// @access Admin
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id)
    if (!announcement) return res.status(404).json({ message: 'Not found' })
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc   Toggle pin
// @route  PATCH /api/announcements/:id/pin
// @access Admin
const togglePin = async (req, res) => {
  try {
    const a = await Announcement.findById(req.params.id)
    if (!a) return res.status(404).json({ message: 'Not found' })
    a.pinned = !a.pinned
    await a.save()
    res.json(a)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc   Send email from admin to selected member roles
// @route  POST /api/announcements/email
// @access Admin
const sendMemberEmail = async (req, res) => {
  try {
    const { subject, message, roles = ['resident'] } = req.body
    if (!subject?.trim()) return res.status(400).json({ message: 'Subject is required' })
    if (!message?.trim()) return res.status(400).json({ message: 'Message is required' })

    const allowedRoles = ['resident', 'guard', 'admin']
    const targetRoles = (Array.isArray(roles) ? roles : [roles])
      .filter(role => allowedRoles.includes(role))

    if (targetRoles.length === 0) {
      return res.status(400).json({ message: 'Select at least one valid recipient role' })
    }

    const recipients = await User.find({
      role: { $in: targetRoles },
      isActive: true,
      email: { $exists: true, $ne: '' },
    }).select('_id name email role')

    if (recipients.length === 0) {
      return res.status(404).json({ message: 'No active members with email found' })
    }

    const uniqueEmails = [...new Set(recipients.map(user => user.email))]
    const results = await Promise.allSettled(
      uniqueEmails.map(to => sendAdminEmail({
        to,
        subject,
        message,
        senderName: req.user.name,
      }))
    )

    await Notification.insertMany(recipients.map(user => ({
      title: subject,
      message,
      type: 'info',
      recipient: user._id,
    })))

    const failed = results.filter(result => result.status === 'rejected')
    const skipped = results.filter(result => result.status === 'fulfilled' && result.value?.skipped)
    const sent = results.filter(result => result.status === 'fulfilled' && !result.value?.skipped)

    res.json({
      message: sent.length > 0
        ? `Email sent to ${sent.length} of ${uniqueEmails.length} recipients`
        : 'Email credentials are not configured. In-app notifications were created.',
      recipients: uniqueEmails.length,
      sent: sent.length,
      skipped: skipped.length,
      failed: failed.length,
      emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  togglePin,
  sendMemberEmail,
}
