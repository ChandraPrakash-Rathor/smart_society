const express = require('express')
const router  = express.Router()
const { chat } = require('./chatController')
const { protect }   = require('../../middleware/authMiddleware')
const { authorise } = require('../../middleware/roleMiddleware')

router.use(protect)
router.post('/', authorise('resident', 'admin', 'guard'), chat)

module.exports = router
