const User          = require('../user/User')
const generateToken = require('../../utils/generateToken')

// @desc   Register new user
// @route  POST /api/auth/register
// @access Public
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, flat, memberSince, familyMembers, emergencyContact, shift, assignedGate } = req.body

    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ message: 'Email already registered' })

    const user = await User.create({
      name, email, password, phone, role,
      flat, memberSince, familyMembers, emergencyContact,
      shift, assignedGate,
    })

    res.status(201).json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      token: generateToken(user._id),
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' })

    if (!user.isActive)
      return res.status(403).json({ message: 'Account is deactivated' })

    res.json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      token: generateToken(user._id),
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc   Get logged-in user profile
// @route  GET /api/auth/me
// @access Protected
const getMe = async (req, res) => {
  res.json(req.user)
}

// @desc   Update logged-in user profile (name, phone)
// @route  PUT /api/auth/me
// @access Protected
const updateMe = async (req, res) => {
  try {
    const { name, phone } = req.body
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true, runValidators: true }
    ).select('-password')
    res.json(user)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

module.exports = { register, login, getMe, updateMe }
