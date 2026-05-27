const User         = require('../user/User')
const Visitor      = require('../visitor/Visitor')
const Staff        = require('../staff/Staff')
const Complaint    = require('../complaint/Complaint')
const Alert        = require('../alert/Alert')
const Maintenance  = require('../maintenance/Maintenance')

// @desc   Get full dashboard stats
// @route  GET /api/admin/stats
// @access Admin
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Last 7 days for visitor chart
    const last7 = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const next = new Date(d)
      next.setDate(next.getDate() + 1)
      const count = await Visitor.countDocuments({ createdAt: { $gte: d, $lt: next } })
      last7.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        visitors: count,
      })
    }

    // Complaints by category
    const complaintCategories = await Complaint.aggregate([
      { $group: { _id: '$category', value: { $sum: 1 } } },
    ])

    const categoryColors = {
      Water: '#60a5fa', Security: '#f87171', Maintenance: '#fbbf24',
      Electricity: '#a78bfa', Other: '#6ee7b7',
    }

    const [
      totalUsers, totalResidents, totalGuards,
      visitorsToday, pendingVisitors,
      openComplaints, activeAlerts,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'resident' }),
      User.countDocuments({ role: 'guard' }),
      Visitor.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
      Visitor.countDocuments({ status: 'Pending' }),
      Complaint.countDocuments({ status: 'Open' }),
      Alert.countDocuments({ resolved: false }),
    ])

    // Recent alerts
    const recentAlerts = await Alert.find()
      .populate('sentBy', 'name flat')
      .sort({ createdAt: -1 })
      .limit(5)

    res.json({
      stats: { totalUsers, totalResidents, totalGuards, visitorsToday, pendingVisitors, openComplaints, activeAlerts },
      visitorsPerDay: last7,
      complaintsByCategory: complaintCategories.map(c => ({
        name: c._id, value: c.value, color: categoryColors[c._id] || '#94a3b8',
      })),
      recentAlerts,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { getDashboardStats }
