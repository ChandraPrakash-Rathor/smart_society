const User = require('./User')
const bcrypt = require('bcryptjs')

// @desc   Get all users (admin only)
// @route  GET /api/users
// @access Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 })
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc   Get single user
// @route  GET /api/users/:id
// @access Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc   Admin creates a new user (with resident details if role=resident)
// @route  POST /api/users
// @access Admin
const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, flat, memberSince, familyMembers, emergencyContact } = req.body

    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ message: 'Email already registered' })

    const user = await User.create({
      name, email, password, phone, role,
      flat, memberSince, familyMembers, emergencyContact,
    })

    const result = user.toObject()
    delete result.password
    res.status(201).json(result)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// @desc   Update user (admin can change role / active status / resident details)
// @route  PUT /api/users/:id
// @access Admin
const updateUser = async (req, res) => {
  try {
    const { name, phone, role, isActive, flat, memberSince, familyMembers, emergencyContact } = req.body
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, role, isActive, flat, memberSince, familyMembers, emergencyContact },
      { new: true, runValidators: true }
    ).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// @desc   Delete user
// @route  DELETE /api/users/:id
// @access Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ message: 'User removed' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser }
