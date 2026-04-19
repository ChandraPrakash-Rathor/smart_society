const mongoose = require('mongoose')

const patrolLogSchema = new mongoose.Schema({
  checkpoint: { type: String, required: true },
  time:       { type: Date, default: Date.now },
  status:     { type: String, enum: ['Clear', 'Alert'], default: 'Clear' },
  notes:      { type: String },
})

const guardSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true },
  phone:      { type: String },
  shift:      { type: String, enum: ['Morning', 'Evening', 'Night'], default: 'Morning' },
  isOnDuty:   { type: Boolean, default: false },
  patrolLogs: [patrolLogSchema],
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

module.exports = mongoose.model('Guard', guardSchema)
