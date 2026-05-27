const express = require('express')
const router  = express.Router()
const { getDashboardStats } = require('./adminController')
const { protect }   = require('../../middleware/authMiddleware')
const { authorise } = require('../../middleware/roleMiddleware')

router.use(protect, authorise('admin'))

router.get('/stats', getDashboardStats)

module.exports = router
