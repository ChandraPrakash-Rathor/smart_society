const Notification = require('../models/Notification')

// @desc  Get notifications for current user
// @route GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 })
    res.json(notifications)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc  Mark notification as read
// @route PATCH /api/notifications/:id/read
const markRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    )
    if (!notification) return res.status(404).json({ message: 'Notification not found' })
    res.json(notification)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc  Mark all notifications as read
// @route PATCH /api/notifications/read-all
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true })
    res.json({ message: 'All notifications marked as read' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc  Delete notification
// @route DELETE /api/notifications/:id
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id })
    if (!notification) return res.status(404).json({ message: 'Notification not found' })
    res.json({ message: 'Notification removed' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { getNotifications, markRead, markAllRead, deleteNotification }
