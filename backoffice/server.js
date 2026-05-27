const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// Allowed Origins
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL
];

// CORS Configuration
app.use(cors({
  origin: function (origin, callback) {

    // allow requests with no origin (Postman/mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true
}));

// Handle preflight requests
app.options("*", cors());

app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./modules/auth/authRoutes'));
app.use('/api/users', require('./modules/user/userRoutes'));
app.use('/api/visitors', require('./modules/visitor/visitorRoutes'));
app.use('/api/staff', require('./modules/staff/staffRoutes'));
app.use('/api/guards', require('./modules/guard/guardRoutes'));
app.use('/api/admin', require('./modules/admin/adminRoutes'));
app.use('/api/notifications', require('./modules/notification/notificationRoutes'));
app.use('/api/alerts', require('./modules/alert/alertRoutes'));
app.use('/api/complaints', require('./modules/complaint/complaintRoutes'));
app.use('/api/announcements', require('./modules/announcement/announcementRoutes'));
app.use('/api/maintenance', require('./modules/maintenance/maintenanceRoutes'));
app.use('/api/resident', require('./modules/resident/residentRoutes'));
app.use('/api/chat', require('./modules/chat/chatRoutes'));

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Smart Society API running' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});