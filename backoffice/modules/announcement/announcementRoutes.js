const express = require('express')
const router  = express.Router()
const {
  getAnnouncements, createAnnouncement,
  updateAnnouncement, deleteAnnouncement, togglePin,
  sendMemberEmail,
} = require('./announcementController')
const { protect }   = require('../../middleware/authMiddleware')
const { authorise } = require('../../middleware/roleMiddleware')

router.use(protect)

// All roles can read
router.get('/', getAnnouncements)

// Admin only — create, update, delete, pin
router.post('/email',      authorise('admin'), sendMemberEmail)
router.post('/',           authorise('admin'), createAnnouncement)
router.put('/:id',         authorise('admin'), updateAnnouncement)
router.delete('/:id',      authorise('admin'), deleteAnnouncement)
router.patch('/:id/pin',   authorise('admin'), togglePin)

module.exports = router
