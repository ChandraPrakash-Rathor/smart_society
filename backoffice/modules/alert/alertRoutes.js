const express = require('express')
const router  = express.Router()
const { sendAlert, getAlerts, resolveAlert } = require('./alertController')
const { protect }   = require('../../middleware/authMiddleware')
const { authorise } = require('../../middleware/roleMiddleware')

router.use(protect)

router.post('/',              authorise('resident'),          sendAlert)
router.get('/',               authorise('admin', 'guard'),    getAlerts)
router.patch('/:id/resolve',  authorise('admin', 'guard'),    resolveAlert)

module.exports = router
