import { createSlice } from '@reduxjs/toolkit'

const guardSlice = createSlice({
  name: 'guard',
  initialState: {
    stats:    { totalToday: 0, pending: 0, approved: 0, rejected: 0, inside: 0 },
    logs:     [],   // entry logs
    visitors: [],   // pending visitors
    profile:  null, // guard profile
    loading:  false,
    error:    null,
  },
  reducers: {
    setStats:   (state, action) => { state.stats   = action.payload },
    setLogs:    (state, action) => { state.logs    = action.payload; state.loading = false },
    setVisitors:(state, action) => { state.visitors = action.payload; state.loading = false },
    setProfile: (state, action) => { state.profile  = action.payload },

    // Add new log to top
    addLog: (state, action) => { state.logs.unshift(action.payload) },

    // Update one log in list
    updateLog: (state, action) => {
      const idx = state.logs.findIndex(l => l._id === action.payload._id)
      if (idx !== -1) state.logs[idx] = action.payload
    },

    // Update visitor status in list
    updateVisitor: (state, action) => {
      const idx = state.visitors.findIndex(v => v._id === action.payload._id)
      if (idx !== -1) state.visitors[idx] = action.payload
    },

    setLoading: (state) => { state.loading = true;  state.error = null },
    setError:   (state, action) => { state.loading = false; state.error = action.payload },
  },
})

export const {
  setStats, setLogs, setVisitors, setProfile,
  addLog, updateLog, updateVisitor,
  setLoading, setError,
} = guardSlice.actions

export default guardSlice.reducer
