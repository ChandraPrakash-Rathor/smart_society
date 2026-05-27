const express = require('express')
const router  = express.Router()
const { getAllUsers, getUserById, createUser, updateUser, deleteUser } = require('./userController')
const { protect }   = require('../../middleware/authMiddleware')
const { authorise } = require('../../middleware/roleMiddleware')

router.use(protect, authorise('admin'))

router.route('/')
  .get(getAllUsers)
  .post(createUser)       // admin creates user

router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser)

module.exports = router
