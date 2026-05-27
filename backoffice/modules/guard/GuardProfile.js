const mongoose = require('mongoose')

const patrolLogSchema = new mongoose.Schema({
  checkpoint: { type: String, required: true },
  time:       { type: Date, default: Date.now },
  status:     { type: String, enum: ['Clear', 'Alert'], default: 'Clear' },
  notes:      { type: String },
})

const guardProfileSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  shift:      { type: String, enum: ['Morning', 'Evening', 'Night'], default: 'Morning' },
  isOnDuty:   { type: Boolean, default: false },
  patrolLogs: [patrolLogSchema],
}, { timestamps: true })

module.exports = mongoose.model('GuardProfile', guardProfileSchema)
