const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Employee = require("../model/Employee"); 
require('dotenv').config();

// Use environment variable with a fallback, but log a warning
const secretKey = process.env.JWT_SECRET || (() => {
  console.warn('WARNING: Using fallback secret key. Set JWT_SECRET in your .env file!');
  return 'your-secret-key-fallback';
})();

const router = express.Router();

// Token verification middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  
  if (!authHeader) {
    return res.status(403).json({ message: "No token provided" });
  }

  // Remove "Bearer " prefix
  const token = authHeader.startsWith("Bearer ") 
    ? authHeader.slice(7) 
    : authHeader;

  try {
    // Use synchronous verify for consistent error handling
    const decoded = jwt.verify(token, secretKey);
    
    // Attach decoded information to the request object
    req.employeeId = decoded.employeeId;
    req.isAdmin = decoded.isAdmin;
    
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    
    // Provide more specific error responses
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }
    
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// Employee login route
router.post("/login", async (req, res) => {
  const { companyMail, password } = req.body;

  // Input validation
  if (!companyMail || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Find employee by email
    const employee = await Employee.findOne({ companyMail });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        employeeId: employee._id, 
        isAdmin: employee.isAdmin,
        companyMail: employee.companyMail
      },
      secretKey,
      { 
        expiresIn: "1h",  // Short-lived token for security
        issuer: 'your-company-name'  // Optional: add issuer
      }
    );

    // Respond with token and user info (excluding sensitive data)
    res.json({
      message: "Login successful",
      token,
      employeeId: employee._id,
      isAdmin: employee.isAdmin,
      companyMail: employee.companyMail
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get current user route
router.get('/me', verifyToken, async (req, res) => {
  try {
    // Find user by ID, excluding password
    const user = await Employee.findById(req.employeeId)
      .select('-password -__v')  // Exclude password and version key
      .lean();  // Use lean for performance if not modifying
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// // Optional: Logout route (client-side token invalidation)
// router.post('/logout', (req, res) => {
//   // In JWT, logout is typically handled client-side by removing the token
//   res.json({ message: "Logout successful" });
// });

module.exports = router;