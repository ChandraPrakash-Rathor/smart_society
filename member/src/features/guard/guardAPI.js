import axiosInstance from '../../utils/axiosInstance'

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const fetchGuardStats = () =>
  axiosInstance.get('/guards/stats')

// ── My Profile ────────────────────────────────────────────────────────────────
export const fetchMyProfile = () =>
  axiosInstance.get('/guards/me')

export const toggleDuty = () =>
  axiosInstance.patch('/guards/duty')

// ── Entry Logs ────────────────────────────────────────────────────────────────
export const fetchEntryLogs = (params = {}) =>
  axiosInstance.get('/guards/logs', { params })

export const createEntryLog = (data) =>
  axiosInstance.post('/guards/logs', data)

export const updateEntryLog = (id, data) =>
  axiosInstance.patch(`/guards/logs/${id}`, data)

// ── Visitor Gate ──────────────────────────────────────────────────────────────
export const fetchPendingVisitors = () =>
  axiosInstance.get('/guards/visitors')

export const approveVisitor = (id) =>
  axiosInstance.patch(`/guards/visitors/${id}/approve`)

export const rejectVisitor = (id) =>
  axiosInstance.patch(`/guards/visitors/${id}/reject`)

export const markVisitorEntry = async (id) => {
  try {
    return await axiosInstance.patch(`/guards/visitors/${id}/entry`)
  } catch (err) {
    if (err.response?.status !== 404) throw err

    const checkIn = new Date().toISOString()
    const { data } = await axiosInstance.put(`/visitors/${id}`, {
      status: 'Approved',
      checkIn,
      checkOut: null,
    })

    let log = null
    try {
      const logRes = await createEntryLog({
        visitor: data._id,
        name: data.name || 'Visitor',
        phone: data.phone || 'N/A',
        flat: data.host || data.flat || 'N/A',
        status: 'Inside',
        timeIn: checkIn,
      })
      log = logRes.data
    } catch {
      // Visitor check-in is enough for the logs API to display it after refresh.
    }

    return { data: { visitor: data, log } }
  }
}

export const markVisitorExit = async (id) => {
  try {
    return await axiosInstance.patch(`/guards/visitors/${id}/exit`)
  } catch (err) {
    if (err.response?.status !== 404) throw err

    const { data } = await axiosInstance.put(`/visitors/${id}`, {
      checkOut: new Date().toISOString(),
    })
    return { data: { visitor: data, log: null } }
  }
}
