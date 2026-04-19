import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import visitorReducer from '../features/visitor/visitorSlice'
import staffReducer from '../features/staff/staffSlice'
import guardReducer from '../features/guard/guardSlice'
import notificationReducer from '../features/notification/notificationSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    visitor: visitorReducer,
    staff: staffReducer,
    guard: guardReducer,
    notification: notificationReducer,
  },
})
