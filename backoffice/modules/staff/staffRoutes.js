const express = require('express')
const router  = express.Router()
const { getStaff, getStaffMember, getStaffPublic, createStaff, updateStaff, deleteStaff, migrateStaff } = require('./staffController')
const { protect }   = require('../../middleware/authMiddleware')
const { authorise } = require('../../middleware/roleMiddleware')

// ── Public — no auth needed (for QR scan page) ────────────────────────────────
router.get('/public/:id', getStaffPublic)

// ── Protected routes ──────────────────────────────────────────────────────────
router.use(protect)

router.post('/migrate', authorise('admin'), migrateStaff)

router.route('/')
  .get(authorise('admin', 'resident', 'guard'), getStaff)
  .post(authorise('admin', 'resident'), createStaff)

router.route('/:id')
  .get(authorise('admin', 'resident', 'guard'), getStaffMember)
  .put(authorise('admin', 'resident'), updateStaff)
  .delete(authorise('admin', 'resident'), deleteStaff)

module.exports = router
