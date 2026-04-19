import { createSlice } from '@reduxjs/toolkit'

const guardSlice = createSlice({
  name: 'guard',
  initialState: { guards: [], loading: false, error: null },
  reducers: {
    setGuards: (state, action) => { state.guards = action.payload },
    addGuard: (state, action) => { state.guards.push(action.payload) },
    removeGuard: (state, action) => {
      state.guards = state.guards.filter(g => g._id !== action.payload)
    },
  },
})

export const { setGuards, addGuard, removeGuard } = guardSlice.actions
export default guardSlice.reducer
