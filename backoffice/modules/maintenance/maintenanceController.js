const Maintenance = require('./Maintenance')
const User        = require('../user/User')

// @desc   Get all maintenance records (admin)
// @route  GET /api/maintenance
// @access Admin
const getAllMaintenance = async (req, res) => {
  try {
    const { month, year, status, flat } = req.query
    const filter = {}
    if (month)  filter.month  = month
    if (year)   filter.year   = Number(year)
    if (status) filter.status = status
    if (flat)   filter.flat   = { $regex: flat, $options: 'i' }

    const records = await Maintenance.find(filter)
      .populate('resident', 'name email phone flat')
      .populate('markedBy', 'name')
      .sort({ year: -1, createdAt: -1 })
    res.json(records)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc   Get maintenance for logged-in resident
// @route  GET /api/maintenance/my
// @access Resident
const getMyMaintenance = async (req, res) => {
  try {
    const records = await Maintenance.find({ resident: req.user._id })
      .sort({ year: -1, createdAt: -1 })
    res.json(records)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc   Resident online payment for own maintenance bill
// @route  PATCH /api/maintenance/my/:id/pay-online
// @access Resident
const payMaintenanceOnline = async (req, res) => {
  try {
    const record = await Maintenance.findOne({
      _id: req.params.id,
      resident: req.user._id,
    })

    if (!record) return res.status(404).json({ message: 'Bill not found' })
    if (record.status === 'Paid') return res.status(400).json({ message: 'Bill is already paid' })

    const method = req.body?.method || 'UPI'
    const paymentId = `PAY_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`

    record.status = 'Paid'
    record.paidOn = new Date()
    record.note = 'Paid online'
    record.paymentMode = 'Online'
    record.paymentId = paymentId
    record.paymentMeta = {
      provider: 'Online Payment Gateway',
      method,
      last4: req.body?.last4 || '',
    }

    await record.save()
    res.json(record)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// @desc   Create maintenance record (admin generates bill)
// @route  POST /api/maintenance
// @access Admin
const createMaintenance = async (req, res) => {
  try {
    const record = await Maintenance.create({
      ...req.body,
      markedBy: req.user._id,
    })
    await record.populate('resident', 'name email phone flat')
    res.status(201).json(record)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// @desc   Generate bills for ALL residents for a month (bulk)
// @route  POST /api/maintenance/generate
// @access Admin
const generateBulk = async (req, res) => {
  try {
    const { month, year, amount, dueDate } = req.body

    // Get all residents
    const residents = await User.find({ role: 'resident', isActive: true })

    // Skip if bill already exists for this month
    const existing = await Maintenance.find({ month, year })
    const existingIds = existing.map(e => e.resident.toString())

    const toCreate = residents
      .filter(r => !existingIds.includes(r._id.toString()))
      .map(r => ({
        resident: r._id,
        flat:     r.flat || 'N/A',
        month, year, amount,
        dueDate:  new Date(dueDate),
        status:   'Pending',
        markedBy: req.user._id,
      }))

    if (toCreate.length === 0)
      return res.status(400).json({ message: 'Bills already generated for all residents this month' })

    const created = await Maintenance.insertMany(toCreate)
    res.status(201).json({ message: `Generated ${created.length} bills`, count: created.length })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// @desc   Mark as Paid / Pending / Overdue
// @route  PATCH /api/maintenance/:id
// @access Admin
const updateStatus = async (req, res) => {
  try {
    const { status, note } = req.body
    const update = { status, note, markedBy: req.user._id }
    if (status === 'Paid') update.paidOn = new Date()

    const record = await Maintenance.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('resident', 'name email phone flat')
    if (!record) return res.status(404).json({ message: 'Record not found' })
    res.json(record)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// @desc   Delete record
// @route  DELETE /api/maintenance/:id
// @access Admin
const deleteMaintenance = async (req, res) => {
  try {
    const record = await Maintenance.findByIdAndDelete(req.params.id)
    if (!record) return res.status(404).json({ message: 'Record not found' })
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc   Get summary stats
// @route  GET /api/maintenance/stats
// @access Admin
const getStats = async (req, res) => {
  try {
    const { month, year } = req.query
    const filter = {}
    if (month) filter.month = month
    if (year)  filter.year  = Number(year)

    const [total, paid, pending, overdue, totalAmount, collectedAmount] = await Promise.all([
      Maintenance.countDocuments(filter),
      Maintenance.countDocuments({ ...filter, status: 'Paid' }),
      Maintenance.countDocuments({ ...filter, status: 'Pending' }),
      Maintenance.countDocuments({ ...filter, status: 'Overdue' }),
      Maintenance.aggregate([{ $match: filter }, { $group: { _id: null, sum: { $sum: '$amount' } } }]),
      Maintenance.aggregate([{ $match: { ...filter, status: 'Paid' } }, { $group: { _id: null, sum: { $sum: '$amount' } } }]),
    ])

    res.json({
      total, paid, pending, overdue,
      totalAmount:     totalAmount[0]?.sum     || 0,
      collectedAmount: collectedAmount[0]?.sum || 0,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = {
  getAllMaintenance,
  getMyMaintenance,
  payMaintenanceOnline,
  createMaintenance,
  generateBulk,
  updateStatus,
  deleteMaintenance,
  getStats,
}
