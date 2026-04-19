const Visitor = require('../models/Visitor')

// @desc  Get all visitors
// @route GET /api/visitors
const getVisitors = async (req, res) => {
  try {
    const { status, date } = req.query
    const filter = {}
    if (status) filter.status = status
    if (date) {
      const start = new Date(date)
      const end = new Date(date)
      end.setDate(end.getDate() + 1)
      filter.createdAt = { $gte: start, $lt: end }
    }
    const visitors = await Visitor.find(filter).populate('approvedBy', 'name').sort({ createdAt: -1 })
    res.json(visitors)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc  Get single visitor
// @route GET /api/visitors/:id
const getVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id).populate('approvedBy', 'name')
    if (!visitor) return res.status(404).json({ message: 'Visitor not found' })
    res.json(visitor)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc  Create visitor
// @route POST /api/visitors
const createVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.create(req.body)
    res.status(201).json(visitor)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// @desc  Update visitor (approve/reject/checkout)
// @route PUT /api/visitors/:id
const updateVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!visitor) return res.status(404).json({ message: 'Visitor not found' })
    res.json(visitor)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// @desc  Delete visitor
// @route DELETE /api/visitors/:id
const deleteVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndDelete(req.params.id)
    if (!visitor) return res.status(404).json({ message: 'Visitor not found' })
    res.json({ message: 'Visitor removed' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc  Approve visitor
// @route PATCH /api/visitors/:id/approve
const approveVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      { status: 'Approved', approvedBy: req.user._id, checkIn: new Date() },
      { new: true }
    )
    if (!visitor) return res.status(404).json({ message: 'Visitor not found' })
    res.json(visitor)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { getVisitors, getVisitor, createVisitor, updateVisitor, deleteVisitor, approveVisitor }
