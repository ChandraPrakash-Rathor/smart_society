const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')

dotenv.config()
connectDB()

const app = express()

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))

app.use(express.json())

// Routes
app.use('/api/auth',          require('./routes/authRoutes'))
app.use('/api/visitors',      require('./routes/visitorRoutes'))
app.use('/api/staff',         require('./routes/staffRoutes'))
app.use('/api/guards',        require('./routes/guardRoutes'))
app.use('/api/notifications', require('./routes/notificationRoutes'))

// Health check
app.get('/', (req, res) => res.json({ message: 'Smart Society API running' }))

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
