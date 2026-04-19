const express = require('express')
const router = express.Router()
const {
  getGuards, getGuard, createGuard,
  updateGuard, deleteGuard, addPatrolLog
} = require('../controllers/guardController')
const { protect, adminOnly } = require('../middleware/authMiddleware')

router.use(protect)

router.route('/')
  .get(getGuards)
  .post(adminOnly, createGuard)

router.route('/:id')
  .get(getGuard)
  .put(adminOnly, updateGuard)
  .delete(adminOnly, deleteGuard)

router.post('/:id/patrol', addPatrolLog)

module.exports = router
