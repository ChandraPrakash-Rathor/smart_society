const mongoose = require('mongoose')

const maintenanceSchema = new mongoose.Schema({
  resident:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  flat:        { type: String, required: true },
  month:       { type: String, required: true },  // e.g. "April 2026"
  year:        { type: Number, required: true },
  amount:      { type: Number, required: true, default: 2000 },
  status:      { type: String, enum: ['Paid', 'Pending', 'Overdue'], default: 'Pending' },
  paidOn:      { type: Date },
  dueDate:     { type: Date, required: true },
  note:        { type: String },
  paymentMode: { type: String },
  paymentId:   { type: String },
  paymentMeta: {
    provider: { type: String },
    method:   { type: String },
    last4:    { type: String },
  },
  markedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // admin who marked
}, { timestamps: true })

module.exports = mongoose.model('Maintenance', maintenanceSchema)
