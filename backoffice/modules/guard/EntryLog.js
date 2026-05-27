const mongoose = require('mongoose')

// Entry log — recorded by guard when a visitor enters/exits the gate
const entryLogSchema = new mongoose.Schema({
  visitor:   { type: mongoose.Schema.Types.ObjectId, ref: 'Visitor' },
  name:      { type: String, required: true, trim: true },
  phone:     { type: String, required: true },
  flat:      { type: String, required: true },
  status:    { type: String, enum: ['Approved', 'Rejected', 'Inside', 'Pending'], default: 'Pending' },
  timeIn:    { type: Date, default: Date.now },
  timeOut:   { type: Date },
  loggedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // guard who logged
}, { timestamps: true })

module.exports = mongoose.model('EntryLog', entryLogSchema)
