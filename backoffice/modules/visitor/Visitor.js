const mongoose = require('mongoose')

const visitorSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  phone:      { type: String, required: true },
  email:      { type: String },
  purpose:    { type: String, required: true },
  host:       { type: String, required: true },
  checkIn:    { type: Date },
  checkOut:   { type: Date },
  status:     { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  qrCode:     { type: String },
  photo:      { type: String },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

module.exports = mongoose.model('Visitor', visitorSchema)
