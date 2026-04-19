const Guard = require('../models/Guard')

// @desc  Get all guards
// @route GET /api/guards
const getGuards = async (req, res) => {
  try {
    const guards = await Guard.find().populate('user', 'name email').sort({ name: 1 })
    res.json(guards)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc  Get single guard
// @route GET /api/guards/:id
const getGuard = async (req, res) => {
  try {
    const guard = await Guard.findById(req.params.id).populate('user', 'name email')
    if (!guard) return res.status(404).json({ message: 'Guard not found' })
    res.json(guard)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc  Create guard
// @route POST /api/guards
const createGuard = async (req, res) => {
  try {
    const guard = await Guard.create(req.body)
    res.status(201).json(guard)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// @desc  Update guard
// @route PUT /api/guards/:id
const updateGuard = async (req, res) => {
  try {
    const guard = await Guard.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!guard) return res.status(404).json({ message: 'Guard not found' })
    res.json(guard)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// @desc  Delete guard
// @route DELETE /api/guards/:id
const deleteGuard = async (req, res) => {
  try {
    const guard = await Guard.findByIdAndDelete(req.params.id)
    if (!guard) return res.status(404).json({ message: 'Guard not found' })
    res.json({ message: 'Guard removed' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc  Add patrol log
// @route POST /api/guards/:id/patrol
const addPatrolLog = async (req, res) => {
  try {
    const guard = await Guard.findById(req.params.id)
    if (!guard) return res.status(404).json({ message: 'Guard not found' })
    guard.patrolLogs.push(req.body)
    await guard.save()
    res.status(201).json(guard)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

module.exports = { getGuards, getGuard, createGuard, updateGuard, deleteGuard, addPatrolLog }
