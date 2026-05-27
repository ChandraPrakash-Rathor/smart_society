const mongoose = require('mongoose')

const staffSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  phone:     { type: String, required: true },
  role:      { type: String, required: true },
  status:    { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  email:     { type: String },
  isPresent: { type: Boolean, default: false },
  checkIn:   { type: Date },
  checkOut:  { type: Date },
  // Owner — the resident who added this staff member
  owner:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

module.exports = mongoose.model('Staff', staffSchema)
