const express = require('express');
const router = express.Router();
const { signup, login, users, me } = require('../routers/auth'); // Check the path
const verifyToken = require('../middleware/auth');

// Define routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/users', users);
router.get('/me', verifyToken, me);
console.log({ signup, login, users, me }); // Ensure all functions are not undefined

module.exports = router;
