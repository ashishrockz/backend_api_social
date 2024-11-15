const express = require('express');
const router = express.Router();
const { signup, login, users, me } = require('../controllers/auth'); // Check the path

// Define routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/users', users);
router.get('/me', me);
console.log({ signup, login, users, me }); // Ensure all functions are not undefined

module.exports = router;
