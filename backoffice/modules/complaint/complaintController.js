const Complaint = require('./Complaint')

// @desc   Submit a complaint
// @route  POST /api/complaints
// @access Resident
const createComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.create({
      ...req.body,
      submittedBy: req.user._id,
    })
    res.status(201).json(complaint)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// @desc   Get my complaints
// @route  GET /api/complaints
// @access Resident
const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ submittedBy: req.user._id })
      .sort({ createdAt: -1 })
    res.json(complaints)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc   Get all complaints (admin)
// @route  GET /api/complaints/all
// @access Admin
const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 })
    res.json(complaints)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc   Update complaint status
// @route  PATCH /api/complaints/:id
// @access Admin
const updateComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    )
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' })
    res.json(complaint)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// @desc   Delete complaint
// @route  DELETE /api/complaints/:id
// @access Resident (own), Admin
const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findOneAndDelete({
      _id: req.params.id,
      submittedBy: req.user._id,
    })
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' })
    res.json({ message: 'Complaint deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { createComplaint, getMyComplaints, getAllComplaints, updateComplaint, deleteComplaint }
