const User        = require('../user/User')
const GuardProfile = require('./GuardProfile')
const EntryLog    = require('./EntryLog')
const Visitor     = require('../visitor/Visitor')

// ─────────────────────────────────────────────────────────────────────────────
// GUARD PROFILE
// ─────────────────────────────────────────────────────────────────────────────

// @desc   Get all guards (admin only)
// @route  GET /api/guards
// @access Admin
const getGuards = async (req, res) => {
  try {
    const guards = await GuardProfile.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
    res.json(guards)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc   Get my guard profile (logged-in guard)
// @route  GET /api/guards/me
// @access Guard
const getMyProfile = async (req, res) => {
  try {
    let profile = await GuardProfile.findOne({ user: req.user._id })
      .populate('user', 'name email phone')

    // Auto-create profile if first login
    if (!profile) {
      profile = await GuardProfile.create({ user: req.user._id })
      await profile.populate('user', 'name email phone')
    }
    res.json(profile)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc   Toggle on-duty status
// @route  PATCH /api/guards/duty
// @access Guard
const toggleDuty = async (req, res) => {
  try {
    let profile = await GuardProfile.findOne({ user: req.user._id })
    if (!profile) profile = await GuardProfile.create({ user: req.user._id })

    profile.isOnDuty = !profile.isOnDuty
    await profile.save()
    res.json({ isOnDuty: profile.isOnDuty })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GUARD DASHBOARD STATS
// ─────────────────────────────────────────────────────────────────────────────

// @desc   Get guard dashboard stats
// @route  GET /api/guards/stats
// @access Guard
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [totalToday, pending, approved, rejected, inside] = await Promise.all([
      EntryLog.countDocuments({ timeIn: { $gte: today, $lt: tomorrow } }),
      EntryLog.countDocuments({ status: 'Pending' }),
      EntryLog.countDocuments({ status: 'Approved', timeIn: { $gte: today, $lt: tomorrow } }),
      EntryLog.countDocuments({ status: 'Rejected', timeIn: { $gte: today, $lt: tomorrow } }),
      EntryLog.countDocuments({ status: 'Inside' }),
    ])

    res.json({ totalToday, pending, approved, rejected, inside })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ENTRY LOGS
// ─────────────────────────────────────────────────────────────────────────────

// @desc   Get today's entry logs
// @route  GET /api/guards/logs
// @access Guard, Admin
const getEntryLogs = async (req, res) => {
  try {
    const { date, status } = req.query

    const filter = {}

    // Filter by date (default = today)
    const day = date ? new Date(date) : new Date()
    day.setHours(0, 0, 0, 0)
    const nextDay = new Date(day)
    nextDay.setDate(nextDay.getDate() + 1)
    filter.timeIn = { $gte: day, $lt: nextDay }

    if (status) filter.status = status

    const logs = await EntryLog.find(filter)
      .populate('loggedBy', 'name')
      .sort({ timeIn: -1 })

    const loggedVisitorIds = new Set(
      logs
        .filter(log => log.visitor)
        .map(log => log.visitor.toString())
    )

    const visitors = await Visitor.find({
      checkIn: { $gte: day, $lt: nextDay },
      _id: { $nin: Array.from(loggedVisitorIds) },
    }).sort({ checkIn: -1 })

    const visitorLogs = visitors
      .map(visitor => ({
        _id: `visitor-${visitor._id}`,
        visitor: visitor._id,
        name: visitor.name || 'Visitor',
        phone: visitor.phone || 'N/A',
        flat: visitor.host || visitor.flat || 'N/A',
        status: visitor.checkOut ? 'Approved' : 'Inside',
        timeIn: visitor.checkIn,
        timeOut: visitor.checkOut,
        loggedBy: visitor.approvedBy,
        createdAt: visitor.checkIn,
        updatedAt: visitor.checkOut || visitor.checkIn,
      }))
      .filter(log => !status || log.status === status)

    res.json([...logs, ...visitorLogs].sort((a, b) => new Date(b.timeIn) - new Date(a.timeIn)))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc   Create entry log
// @route  POST /api/guards/logs
// @access Guard
const createEntryLog = async (req, res) => {
  try {
    const log = await EntryLog.create({
      ...req.body,
      loggedBy: req.user._id,
      timeIn: new Date(),
    })
    res.status(201).json(log)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// @desc   Update entry log status (mark exit / approve / reject)
// @route  PATCH /api/guards/logs/:id
// @access Guard, Admin
const updateEntryLog = async (req, res) => {
  try {
    const update = { ...req.body }

    // If marking as exited, set timeOut
    if (req.body.status === 'Approved' || req.body.timeOut) {
      update.timeOut = update.timeOut || new Date()
    }

    const log = await EntryLog.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!log) return res.status(404).json({ message: 'Log not found' })
    res.json(log)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const createOrUpdateVisitorEntryLog = async ({ visitor, guardId, timeIn }) => {
  const openLog = await EntryLog.findOne({
    visitor: visitor._id,
    $or: [{ timeOut: { $exists: false } }, { timeOut: null }],
  }).sort({ timeIn: -1 })

  if (openLog) return openLog

  return EntryLog.create({
    visitor: visitor._id,
    name: visitor.name || 'Visitor',
    phone: visitor.phone || 'N/A',
    flat: visitor.host || visitor.flat || 'N/A',
    status: 'Inside',
    timeIn,
    loggedBy: guardId,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// VISITOR APPROVE / REJECT (guard action on visitor requests)
// ─────────────────────────────────────────────────────────────────────────────

// @desc   Get ALL visitors for guard (not just pending)
// @route  GET /api/guards/visitors
// @access Guard
const getPendingVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find()
      .sort({ createdAt: -1 })
      .limit(100)
    res.json(visitors)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc   Approve visitor
// @route  PATCH /api/guards/visitors/:id/approve
// @access Guard, Admin
const approveVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      { status: 'Approved', approvedBy: req.user._id },
      { new: true }
    )
    if (!visitor) return res.status(404).json({ message: 'Visitor not found' })
    res.json(visitor)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc   Mark visitor entry time
// @route  PATCH /api/guards/visitors/:id/entry
// @access Guard, Admin
const markVisitorEntry = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id)
    if (!visitor) return res.status(404).json({ message: 'Visitor not found' })
    if (visitor.status === 'Rejected') {
      return res.status(400).json({ message: 'Rejected visitor cannot enter' })
    }

    const entryTime = new Date()
    visitor.status = 'Approved'
    visitor.approvedBy = req.user._id
    visitor.checkIn = visitor.checkIn || entryTime
    visitor.checkOut = undefined
    await visitor.save()

    const log = await createOrUpdateVisitorEntryLog({
      visitor,
      guardId: req.user._id,
      timeIn: visitor.checkIn,
    })

    res.json({ visitor, log })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// @desc   Mark visitor exit time
// @route  PATCH /api/guards/visitors/:id/exit
// @access Guard, Admin
const markVisitorExit = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id)
    if (!visitor) return res.status(404).json({ message: 'Visitor not found' })
    if (!visitor.checkIn) {
      return res.status(400).json({ message: 'Entry time is required before exit' })
    }

    const exitTime = new Date()
    visitor.checkOut = exitTime
    await visitor.save()

    const log = await EntryLog.findOneAndUpdate(
      { visitor: visitor._id, $or: [{ timeOut: { $exists: false } }, { timeOut: null }] },
      { timeOut: exitTime, status: 'Approved' },
      { new: true, sort: { timeIn: -1 } }
    )

    res.json({ visitor, log })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// @desc   Reject visitor
// @route  PATCH /api/guards/visitors/:id/reject
// @access Guard, Admin
const rejectVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      { status: 'Rejected' },
      { new: true }
    )
    if (!visitor) return res.status(404).json({ message: 'Visitor not found' })
    res.json(visitor)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = {
  getGuards, getMyProfile, toggleDuty,
  getDashboardStats,
  getEntryLogs, createEntryLog, updateEntryLog,
  getPendingVisitors, approveVisitor, rejectVisitor,
  markVisitorEntry, markVisitorExit,
}
