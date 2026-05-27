const Staff = require('./Staff')
const User  = require('../user/User')

// @desc   Get all staff
// @route  GET /api/staff
// @access Resident, Admin
const getStaff = async (req, res) => {
  try {
    const staff = await Staff.find()
      .populate('owner', 'name flat phone')
      .sort({ name: 1 })
    res.json(staff)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc   Get single staff member (protected)
// @route  GET /api/staff/:id
// @access Resident, Admin
const getStaffMember = async (req, res) => {
  try {
    const member = await Staff.findById(req.params.id)
      .populate('owner', 'name flat phone email')
    if (!member) return res.status(404).json({ message: 'Staff member not found' })
    res.json(member)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc   Get single staff member — PUBLIC (for QR scan, no auth)
// @route  GET /api/staff/public/:id
// @access Public
const getStaffPublic = async (req, res) => {
  try {
    const member = await Staff.findById(req.params.id)
      .populate('owner', 'name flat phone')
    if (!member) return res.status(404).json({ message: 'Staff member not found' })
    res.json(member)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc   Create staff member — auto-attach owner from logged-in resident
// @route  POST /api/staff
// @access Admin, Resident
const createStaff = async (req, res) => {
  try {
    const member = await Staff.create({
      ...req.body,
      owner: req.user._id,   // save who added this staff
    })
    await member.populate('owner', 'name flat phone')
    res.status(201).json(member)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// @desc   Migrate — remove stale 'user' field from old staff docs (run once)
// @route  POST /api/staff/migrate
// @access Admin
const migrateStaff = async (req, res) => {
  try {
    const result = await Staff.updateMany({}, { $unset: { user: '' } })
    res.json({ message: `Cleaned ${result.modifiedCount} staff documents` })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc   Update staff member
// @route  PUT /api/staff/:id
// @access Admin, Resident
const updateStaff = async (req, res) => {
  try {
    const member = await Staff.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    }).populate('owner', 'name flat phone')
    if (!member) return res.status(404).json({ message: 'Staff member not found' })
    res.json(member)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// @desc   Delete staff member
// @route  DELETE /api/staff/:id
// @access Admin, Resident
const deleteStaff = async (req, res) => {
  try {
    const member = await Staff.findByIdAndDelete(req.params.id)
    if (!member) return res.status(404).json({ message: 'Staff member not found' })
    res.json({ message: 'Staff member removed' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { getStaff, getStaffMember, getStaffPublic, createStaff, updateStaff, deleteStaff, migrateStaff }
