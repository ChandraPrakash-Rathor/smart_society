const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    // Disable strict populate globally — prevents crash when old docs
    // have fields (like 'user') that no longer exist in the current schema
    mongoose.set('strictPopulate', false)

    const conn = await mongoose.connect(process.env.MONGO_URI)
    console.log(`MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`)
    process.exit(1)
  }
}

module.exports = connectDB
