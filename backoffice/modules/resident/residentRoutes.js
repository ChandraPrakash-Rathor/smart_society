const express = require('express')
const router  = express.Router()
const { getDashboardStats } = require('./residentController')
const { protect }   = require('../../middleware/authMiddleware')
const { authorise } = require('../../middleware/roleMiddleware')

router.use(protect)

router.get('/stats', authorise('resident'), getDashboardStats)

module.exports = router
