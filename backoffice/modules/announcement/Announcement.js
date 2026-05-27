const mongoose = require('mongoose')

const announcementSchema = new mongoose.Schema({
  title:    { type: String, required: true, trim: true },
  body:     { type: String, required: true },
  category: { type: String, enum: ['General', 'Maintenance', 'Event', 'Security', 'Urgent'], default: 'General' },
  pinned:   { type: Boolean, default: false },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

module.exports = mongoose.model('Announcement', announcementSchema)
