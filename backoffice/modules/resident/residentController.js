const Visitor     = require('../visitor/Visitor')
const Staff       = require('../staff/Staff')
const Complaint   = require('../complaint/Complaint')
const Maintenance = require('../maintenance/Maintenance')

// @desc   Get resident dashboard stats
// @route  GET /api/resident/stats
// @access Resident
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [
      totalVisitors,
      pendingVisitors,
      approvedToday,
      totalStaff,
      activeStaff,
      openComplaints,
      pendingMaintenance,
    ] = await Promise.all([
      Visitor.countDocuments({ host: req.user.flat }),
      Visitor.countDocuments({ host: req.user.flat, status: 'Pending' }),
      Visitor.countDocuments({ host: req.user.flat, status: 'Approved', updatedAt: { $gte: today, $lt: tomorrow } }),
      Staff.countDocuments(),
      Staff.countDocuments({ status: 'Active' }),
      Complaint.countDocuments({ submittedBy: userId, status: { $ne: 'Resolved' } }),
      Maintenance.countDocuments({ resident: userId, status: 'Pending' }),
    ])

    // Recent visitors (last 5)
    const recentVisitors = await Visitor.find({ host: req.user.flat })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name phone purpose status createdAt')

    res.json({
      stats: {
        totalVisitors,
        pendingVisitors,
        approvedToday,
        totalStaff,
        activeStaff,
        openComplaints,
        pendingMaintenance,
      },
      recentVisitors,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { getDashboardStats }
