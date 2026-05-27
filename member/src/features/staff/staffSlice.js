import { createSlice } from '@reduxjs/toolkit'

const staffSlice = createSlice({
  name: 'staff',
  initialState: {
    staffList: [],  // list from API
    loading:   false,
    error:     null,
  },
  reducers: {
    // Replace full list (on fetch)
    setStaff: (state, action) => {
      state.staffList = action.payload
      state.loading   = false
      state.error     = null
    },
    // Add one to top (on create)
    addStaff: (state, action) => {
      state.staffList.unshift(action.payload)
    },
    // Replace one in list (on update)
    updateStaff: (state, action) => {
      const idx = state.staffList.findIndex(s => s._id === action.payload._id)
      if (idx !== -1) state.staffList[idx] = action.payload
    },
    // Remove one (on delete)
    removeStaff: (state, action) => {
      state.staffList = state.staffList.filter(s => s._id !== action.payload)
    },
    setLoading: (state) => { state.loading = true;  state.error = null },
    setError:   (state, action) => { state.loading = false; state.error = action.payload },
  },
})

export const { setStaff, addStaff, updateStaff, removeStaff, setLoading, setError } = staffSlice.actions
export default staffSlice.reducer
