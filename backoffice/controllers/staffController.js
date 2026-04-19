const Staff = require('../models/Staff')

// @desc  Get all staff
// @route GET /api/staff
const getStaff = async (req, res) => {
  try {
    const staff = await Staff.find().populate('user', 'name email').sort({ name: 1 })
    res.json(staff)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc  Get single staff member
// @route GET /api/staff/:id
const getStaffMember = async (req, res) => {
  try {
    const member = await Staff.findById(req.params.id).populate('user', 'name email')
    if (!member) return res.status(404).json({ message: 'Staff member not found' })
    res.json(member)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc  Create staff member
// @route POST /api/staff
const createStaff = async (req, res) => {
  try {
    const member = await Staff.create(req.body)
    res.status(201).json(member)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// @desc  Update staff member
// @route PUT /api/staff/:id
const updateStaff = async (req, res) => {
  try {
    const member = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!member) return res.status(404).json({ message: 'Staff member not found' })
    res.json(member)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// @desc  Delete staff member
// @route DELETE /api/staff/:id
const deleteStaff = async (req, res) => {
  try {
    const member = await Staff.findByIdAndDelete(req.params.id)
    if (!member) return res.status(404).json({ message: 'Staff member not found' })
    res.json({ message: 'Staff member removed' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc  Staff check-in
// @route PATCH /api/staff/:id/checkin
const checkIn = async (req, res) => {
  try {
    const member = await Staff.findByIdAndUpdate(
      req.params.id,
      { checkIn: new Date(), isPresent: true, checkOut: null },
      { new: true }
    )
    if (!member) return res.status(404).json({ message: 'Staff member not found' })
    res.json(member)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc  Staff check-out
// @route PATCH /api/staff/:id/checkout
const checkOut = async (req, res) => {
  try {
    const member = await Staff.findByIdAndUpdate(
      req.params.id,
      { checkOut: new Date(), isPresent: false },
      { new: true }
    )
    if (!member) return res.status(404).json({ message: 'Staff member not found' })
    res.json(member)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { getStaff, getStaffMember, createStaff, updateStaff, deleteStaff, checkIn, checkOut }
