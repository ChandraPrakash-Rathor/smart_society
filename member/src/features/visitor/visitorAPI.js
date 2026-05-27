import axiosInstance from '../../utils/axiosInstance'

// Get all visitors (optional query: ?status=Pending&date=2024-01-01)
export const fetchVisitors = (params = {}) =>
  axiosInstance.get('/visitors', { params })

// Get single visitor
export const fetchVisitorById = (id) =>
  axiosInstance.get(`/visitors/${id}`)

// Create new visitor
export const createVisitor = (data) =>
  axiosInstance.post('/visitors', data)

// Update visitor
export const updateVisitor = (id, data) =>
  axiosInstance.put(`/visitors/${id}`, data)

// Approve visitor
export const approveVisitor = (id) =>
  axiosInstance.patch(`/visitors/${id}/approve`)

// Delete visitor
export const deleteVisitor = (id) =>
  axiosInstance.delete(`/visitors/${id}`)
