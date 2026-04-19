const express = require('express')
const router = express.Router()
const {
  getVisitors, getVisitor, createVisitor,
  updateVisitor, deleteVisitor, approveVisitor
} = require('../controllers/visitorController')
const { protect, adminOnly } = require('../middleware/authMiddleware')

router.use(protect)

router.route('/')
  .get(getVisitors)
  .post(createVisitor)

router.route('/:id')
  .get(getVisitor)
  .put(updateVisitor)
  .delete(adminOnly, deleteVisitor)

router.patch('/:id/approve', approveVisitor)

module.exports = router
