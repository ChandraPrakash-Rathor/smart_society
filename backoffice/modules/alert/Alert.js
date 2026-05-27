const mongoose = require('mongoose')

const alertSchema = new mongoose.Schema({
  sentBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message:  { type: String, default: 'Emergency! Immediate assistance required.' },
  flat:     { type: String },
  resolved: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('Alert', alertSchema)
