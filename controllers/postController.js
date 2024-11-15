const Post = require('../models/Posts');

// exports.createPost = async (req, res) => {
//   const { content, imageUrl } = req.body;
//   try {
//     const newPost = await Post.create({ user: req.userId, content, imageUrl });
//     res.status(201).json(newPost);
//   } catch (error) {
//     res.status(400).json({ error: 'Error creating post' });
//   }
// };
exports.getPosts = async (req, res) => {
    try {
      const posts = await Post.find().populate('user', 'username').sort({ createdAt: -1 });
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching posts' });
    }
  };
exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};
exports.createPost = async (req, res) => {
  const { content, imageUrl } = req.body;
  console.log('User ID in createPost:', req.userId); // Debugging log
  try {
    const newPost = await Post.create({ user: req.userId, content, imageUrl });
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(400).json({ error: 'Error creating post', details: error.message });
  }
};