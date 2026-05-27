const express = require('express')
const router  = express.Router()
const {
  getGuards, getMyProfile, toggleDuty,
  getDashboardStats,
  getEntryLogs, createEntryLog, updateEntryLog,
  getPendingVisitors, approveVisitor, rejectVisitor,
  markVisitorEntry, markVisitorExit,
} = require('./guardController')
const { protect }   = require('../../middleware/authMiddleware')
const { authorise } = require('../../middleware/roleMiddleware')

router.use(protect)

// ── Profile ───────────────────────────────────────────────────────────────────
router.get('/',    authorise('admin'),          getGuards)       // admin: list all guards
router.get('/me',  authorise('guard'),          getMyProfile)    // guard: my profile
router.patch('/duty', authorise('guard'),       toggleDuty)      // guard: toggle on/off duty

// ── Dashboard stats ───────────────────────────────────────────────────────────
router.get('/stats', authorise('guard', 'admin'), getDashboardStats)

// ── Entry Logs ────────────────────────────────────────────────────────────────
router.get('/logs',     authorise('guard', 'admin'), getEntryLogs)    // GET  /api/guards/logs
router.post('/logs',    authorise('guard'),           createEntryLog)  // POST /api/guards/logs
router.patch('/logs/:id', authorise('guard', 'admin'), updateEntryLog) // PATCH /api/guards/logs/:id

// ── Visitor gate actions ──────────────────────────────────────────────────────
router.get('/visitors',              authorise('guard', 'admin'), getPendingVisitors)
router.patch('/visitors/:id/approve', authorise('guard', 'admin'), approveVisitor)
router.patch('/visitors/:id/reject',  authorise('guard', 'admin'), rejectVisitor)
router.patch('/visitors/:id/entry',   authorise('guard', 'admin'), markVisitorEntry)
router.patch('/visitors/:id/exit',    authorise('guard', 'admin'), markVisitorExit)

module.exports = router
