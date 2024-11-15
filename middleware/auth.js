const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (!token) {
      console.log('No token provided');
      return res.status(403).json({ message: 'Please login' });
    }
  
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        console.error('Failed to authenticate token:', err.message);
        return res.status(403).json({ message: 'Failed to authenticate token' });
      }
      req.userId = decoded.id;
      req.userRole = decoded.role;
      next();
    });
  };
  module.exports = verifyToken;