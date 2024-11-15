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
// exports.createPost = async (req, res) => {
//   const { content, imageUrl } = req.body;
//   console.log('User ID in createPost:', req.userId); // Debugging log
//   try {
//     const newPost = await Post.create({ user: req.userId, content, imageUrl });
//     res.status(201).json(newPost);
//   } catch (error) {
//     console.error('Error creating post:', error);
//     res.status(400).json({ error: 'Error creating post', details: error.message });
//   }
// };
const cloudinary = require('cloudinary').v2;

// Set up Cloudinary configuration (do this in your environment variables)
cloudinary.config({
  cloud_name: 'dyqmr5gxd',
  api_key: '132426531318371',
  api_secret: 'qTQgV3KCcKcq5Wyfwb3MH3YuAuI',
});

exports.createPost = async (req, res) => {
  const { content, imageUri } = req.body;

  try {
    // Upload image to Cloudinary
    const uploadedImage = await cloudinary.uploader.upload(imageUri, {
      folder: 'posts', // Optional folder in Cloudinary
    });

    // Create a new post with the image URL
    const newPost = await Post.create({
      user: req.userId,
      content,
      imageUrl: uploadedImage.secure_url, // Save the Cloudinary URL
    });

    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(400).json({ error: 'Error creating post', details: error.message });
  }
};
