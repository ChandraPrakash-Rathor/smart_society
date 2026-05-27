const express = require('express')
const router  = express.Router()
const {
  getAllMaintenance, getMyMaintenance, createMaintenance,
  generateBulk, updateStatus, deleteMaintenance, getStats,
  payMaintenanceOnline,
} = require('./maintenanceController')
const { protect }   = require('../../middleware/authMiddleware')
const { authorise } = require('../../middleware/roleMiddleware')

router.use(protect)

// Resident — view own bills
router.get('/my', authorise('resident'), getMyMaintenance)
router.patch('/my/:id/pay-online', authorise('resident'), payMaintenanceOnline)

// Admin — full management
router.get('/',              authorise('admin'), getAllMaintenance)
router.get('/stats',         authorise('admin'), getStats)
router.post('/',             authorise('admin'), createMaintenance)
router.post('/generate',     authorise('admin'), generateBulk)
router.patch('/:id',         authorise('admin'), updateStatus)
router.delete('/:id',        authorise('admin'), deleteMaintenance)

module.exports = router
