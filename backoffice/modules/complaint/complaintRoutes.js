const express = require('express')
const router  = express.Router()
const { createComplaint, getMyComplaints, getAllComplaints, updateComplaint, deleteComplaint } = require('./complaintController')
const { protect }   = require('../../middleware/authMiddleware')
const { authorise } = require('../../middleware/roleMiddleware')

router.use(protect)

router.post('/',     authorise('resident'),       createComplaint)
router.get('/',      authorise('resident'),       getMyComplaints)
router.get('/all',   authorise('admin'),          getAllComplaints)
router.patch('/:id', authorise('admin'),          updateComplaint)
router.delete('/:id',authorise('resident'),       deleteComplaint)

module.exports = router
