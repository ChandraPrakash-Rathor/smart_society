import axiosInstance from '../../utils/axiosInstance'

// Get all staff
export const fetchStaff = () =>
  axiosInstance.get('/staff')

// Get single staff member
export const fetchStaffById = (id) =>
  axiosInstance.get(`/staff/${id}`)

// Create staff member
export const createStaff = (data) =>
  axiosInstance.post('/staff', data)

// Update staff member
export const updateStaff = (id, data) =>
  axiosInstance.put(`/staff/${id}`, data)

// Staff check-in
export const staffCheckIn = (id) =>
  axiosInstance.patch(`/staff/${id}/checkin`)

// Staff check-out
export const staffCheckOut = (id) =>
  axiosInstance.patch(`/staff/${id}/checkout`)

// Delete staff member
export const deleteStaff = (id) =>
  axiosInstance.delete(`/staff/${id}`)
