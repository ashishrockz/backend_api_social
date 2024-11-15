const Post = require('../models/Posts');
const multer = require('multer');
const path = require('path');

// File upload configuration (multer)
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Create a new post
exports.createPost = [
  upload.single('image'),
  async (req, res) => {
    const { content, caption } = req.body;
    const user = req.userId;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    try {
      const post = await Post.create({ user, content, caption, imageUrl });
      res.status(201).json(post);
    } catch (error) {
      res.status(400).json({ error: 'Error creating post', details: error.message });
    }
  }
];
exports.getPosts = async (req, res) => {
    try {
      const posts = await Post.find().populate('user', 'username').sort({ createdAt: -1 });
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching posts' });
    }
  };
// Get posts by user
exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};