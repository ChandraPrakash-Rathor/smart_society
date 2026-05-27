import { createSlice } from '@reduxjs/toolkit'

const visitorSlice = createSlice({
  name: 'visitor',
  initialState: {
    visitors: [],  // list from API
    loading:  false,
    error:    null,
  },
  reducers: {
    // Replace full list (on fetch)
    setVisitors: (state, action) => {
      state.visitors = action.payload
      state.loading  = false
      state.error    = null
    },
    // Add one to top of list (on create)
    addVisitor: (state, action) => {
      state.visitors.unshift(action.payload)
    },
    // Replace one in list (on update)
    updateVisitor: (state, action) => {
      const idx = state.visitors.findIndex(v => v._id === action.payload._id)
      if (idx !== -1) state.visitors[idx] = action.payload
    },
    // Remove one from list (on delete)
    removeVisitor: (state, action) => {
      state.visitors = state.visitors.filter(v => v._id !== action.payload)
    },
    setLoading: (state) => { state.loading = true;  state.error = null },
    setError:   (state, action) => { state.loading = false; state.error = action.payload },
  },
})

export const { setVisitors, addVisitor, updateVisitor, removeVisitor, setLoading, setError } = visitorSlice.actions
export default visitorSlice.reducer
