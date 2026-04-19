const mongoose = require('mongoose')

const staffSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true },
  phone:      { type: String },
  role:       { type: String, required: true },
  department: { type: String },
  checkIn:    { type: Date },
  checkOut:   { type: Date },
  isPresent:  { type: Boolean, default: false },
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

module.exports = mongoose.model('Staff', staffSchema)
