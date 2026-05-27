import { createSlice } from '@reduxjs/toolkit'

// Rehydrate from localStorage so login survives page reload
const token = localStorage.getItem('token')
const user  = (() => {
  try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
})()

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: user || null, token: token || null, loading: false, error: null },
  reducers: {
    setCredentials: (state, action) => {
      state.user  = action.payload.user
      state.token = action.payload.token
      // Persist to localStorage
      localStorage.setItem('token', action.payload.token)
      localStorage.setItem('user',  JSON.stringify(action.payload.user))
    },
    logout: (state) => {
      state.user  = null
      state.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
