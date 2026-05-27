const express = require('express')
const cors    = require('cors')
const dotenv  = require('dotenv')
const connectDB = require('./config/db')

dotenv.config()
connectDB()

const app = express()

app.use(cors({
  origin: [
    process.env.CLIENT_URL,
    "http://localhost:5173"
  ],
  credentials: true
}));

app.use(express.json())

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./modules/auth/authRoutes'))
app.use('/api/users',         require('./modules/user/userRoutes'))
app.use('/api/visitors',      require('./modules/visitor/visitorRoutes'))
app.use('/api/staff',         require('./modules/staff/staffRoutes'))
app.use('/api/guards',        require('./modules/guard/guardRoutes'))
app.use('/api/admin',         require('./modules/admin/adminRoutes'))
app.use('/api/notifications', require('./modules/notification/notificationRoutes'))
app.use('/api/alerts',         require('./modules/alert/alertRoutes'))
app.use('/api/complaints',    require('./modules/complaint/complaintRoutes'))
app.use('/api/announcements', require('./modules/announcement/announcementRoutes'))
app.use('/api/maintenance',   require('./modules/maintenance/maintenanceRoutes'))
app.use('/api/resident',      require('./modules/resident/residentRoutes'))
app.use('/api/chat',          require('./modules/chat/chatRoutes'))

// Health check
app.get('/', (req, res) => res.json({ message: 'Smart Society API running' }))

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' })
})

const PORT = process.env.PORT || 5001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
