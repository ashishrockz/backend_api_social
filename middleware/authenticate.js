const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET || 'your-secret-key';  // Ensure you're using the correct secret key

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  
  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  console.log("Token received:", token);  // Add this log for debugging

  // Remove "Bearer " prefix if it's there
  const tokenWithoutBearer = token.replace("Bearer ", "");

  jwt.verify(tokenWithoutBearer, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log("Decoded token:", decoded);  // Log decoded token for debugging

    // Attach decoded information to the request object
    req.employeeId = decoded.id;
    req.isAdmin = decoded.isAdmin;
    
    next();
  });
};

module.exports = verifyToken;
