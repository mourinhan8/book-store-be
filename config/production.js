require('dotenv').config()

module.exports = {
  mongoURI: process.env.MONGO_URL,
  jwtSecret: process.env.JWT_SECRET,
  "admin-signup-key": process.env.ADMIN_SIGNUP_KEY
}
