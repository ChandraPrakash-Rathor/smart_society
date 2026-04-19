import { createSlice } from '@reduxjs/toolkit'

const visitorSlice = createSlice({
  name: 'visitor',
  initialState: { visitors: [], loading: false, error: null },
  reducers: {
    setVisitors: (state, action) => { state.visitors = action.payload },
    addVisitor: (state, action) => { state.visitors.push(action.payload) },
    removeVisitor: (state, action) => {
      state.visitors = state.visitors.filter(v => v._id !== action.payload)
    },
  },
})

export const { setVisitors, addVisitor, removeVisitor } = visitorSlice.actions
export default visitorSlice.reducer
