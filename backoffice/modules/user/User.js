const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

// Family member sub-schema
const familyMemberSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  relation:     { type: String, required: true }, // e.g. Wife, Son, Daughter
  age:          { type: Number },
  phone:        { type: String },
}, { _id: false })

// Emergency contact sub-schema
const emergencyContactSchema = new mongoose.Schema({
  name:         { type: String },
  relation:     { type: String },
  phone:        { type: String },
}, { _id: false })

const userSchema = new mongoose.Schema({
  // ── Common fields ──────────────────────────────────────────────────────────
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role:     { type: String, enum: ['admin', 'resident', 'guard'], default: 'resident' },
  phone:    { type: String },
  isActive: { type: Boolean, default: true },

  // ── Resident-only fields ───────────────────────────────────────────────────
  flat:             { type: String },
  memberSince:      { type: Date },
  familyMembers:    { type: [familyMemberSchema], default: [] },
  emergencyContact: { type: emergencyContactSchema },

  // ── Guard-only fields ──────────────────────────────────────────────────────
  shift:            { type: String, enum: ['Morning', 'Evening', 'Night'] },
  assignedGate:     { type: String },

}, { timestamps: true })

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

// Compare plain password with hashed
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password)
}

module.exports = mongoose.model('User', userSchema)
