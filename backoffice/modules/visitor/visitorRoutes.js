const express = require('express')
const router  = express.Router()
const {
  getVisitors, getVisitor, createVisitor,
  updateVisitor, approveVisitor, rejectVisitor, deleteVisitor,
} = require('./visitorController')
const { protect }   = require('../../middleware/authMiddleware')
const { authorise } = require('../../middleware/roleMiddleware')

router.use(protect)

router.route('/')
  .get(authorise('admin', 'resident', 'guard'), getVisitors)
  .post(authorise('admin', 'resident', 'guard'), createVisitor)

// Public — QR page needs to fetch visitor by ID without login
router.get('/public/:id', getVisitor)

router.route('/:id')
  .get(authorise('admin', 'resident', 'guard'), getVisitor)
  .put(authorise('admin', 'resident', 'guard'), updateVisitor)
  .delete(authorise('admin', 'resident', 'guard'), deleteVisitor)

router.patch('/:id/approve', authorise('admin', 'guard'), approveVisitor)
router.patch('/:id/reject',  authorise('admin', 'guard'), rejectVisitor)

module.exports = router
