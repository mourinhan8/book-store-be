const jwt = require('jsonwebtoken');
const jwt_secret = process.env.JWT_SECRET;
module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Varify token
  try {
    const decoded = jwt.verify(token, jwt_secret);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
