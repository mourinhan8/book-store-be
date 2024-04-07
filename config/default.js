require('dotenv').config()

module.exports = {
  mongoURI: process.env.MONGO_URL,
  jwtSecret: "bookstoreapi",
  "admin-signup-key": "admin-book"
}
