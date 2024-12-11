const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  // Get the token from the Authorization header
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  // Verify the JWT token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    // Add the decoded user info to the request object
    req.user = decoded;
    next(); // Pass control to the next middleware or route handler
  });
};

module.exports = authenticateToken;
