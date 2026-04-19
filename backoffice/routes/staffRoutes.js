const express = require('express')
const router = express.Router()
const {
  getStaff, getStaffMember, createStaff,
  updateStaff, deleteStaff, checkIn, checkOut
} = require('../controllers/staffController')
const { protect, adminOnly } = require('../middleware/authMiddleware')

router.use(protect)

router.route('/')
  .get(getStaff)
  .post(adminOnly, createStaff)

router.route('/:id')
  .get(getStaffMember)
  .put(adminOnly, updateStaff)
  .delete(adminOnly, deleteStaff)

router.patch('/:id/checkin',  checkIn)
router.patch('/:id/checkout', checkOut)

module.exports = router
