import { createSlice } from '@reduxjs/toolkit'

const staffSlice = createSlice({
  name: 'staff',
  initialState: { staffList: [], loading: false, error: null },
  reducers: {
    setStaff: (state, action) => { state.staffList = action.payload },
    addStaff: (state, action) => { state.staffList.push(action.payload) },
    removeStaff: (state, action) => {
      state.staffList = state.staffList.filter(s => s._id !== action.payload)
    },
  },
})

export const { setStaff, addStaff, removeStaff } = staffSlice.actions
export default staffSlice.reducer
