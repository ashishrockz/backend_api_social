require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const connection = require('./service/db');
const authentication = require('./routes/authRoutes');
const { createPost, getPosts } = require('./controllers/postController');
const { addComment } = require('./controllers/commentController');
const { toggleLike } = require('./controllers/likeController');
const verifyToken = require('./middleware/auth');

// Database connection
connection();

// Initialize Express app
const app = express();

// Middlewares
app.use(cors()); // CORS middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.use('/auth', authentication);

// Post routes
app.post('/posts', verifyToken, createPost);
app.get('/posts', verifyToken, getPosts);

// Comment route
app.post('/comments', verifyToken, addComment);

// Like route
app.post('/likes', verifyToken, toggleLike);

// Root route for API
app.get('/', (req, res) => {
  res.send('Welcome to the API');
});

// Catch-all route for undefined routes
app.use((req, res) => {
  res.status(404).send('404: Not Found');
});

// Start server
const port = process.env.PORT || 8081;
app.listen(port, () => {
  console.log(`Server running on port ${port}...`);
});