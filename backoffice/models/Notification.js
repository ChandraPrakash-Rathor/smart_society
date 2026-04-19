const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  message:   { type: String, required: true },
  type:      { type: String, enum: ['info', 'warning', 'alert', 'success'], default: 'info' },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  read:      { type: Boolean, default: false },
  link:      { type: String },
}, { timestamps: true })

module.exports = mongoose.model('Notification', notificationSchema)
