const Post = require('../models/Posts');
const express = require('express');

const app = express();


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

// Cloudinary configuration
cloudinary.config({
  cloud_name: 'dyqmr5gxd',
  api_key: '132426531318371',
  api_secret: 'qTQgV3KCcKcq5Wyfwb3MH3YuAuI',
});

// Create Post Controller
exports.createPost = async (req, res) => {
  const { content } = req.body;

  // Use multer middleware before entering this function, so req.file is populated
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Upload the file to Cloudinary
    const uploadedImage = await cloudinary.uploader.upload(req.file.path, {
      folder: 'posts',
    });

    // Save the post with the image URL
    const newPost = await Post.create({
      user: req.userId,
      content,
      imageUrl: uploadedImage.secure_url,
    });

    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(400).json({ error: 'Error creating post', details: error.message });
  }
};
exports.updatePost = async (req, res) => {
  const { content } = req.body;
  const postId = req.params.id;

  try {
    // Find the post by ID
    const post = await Post.findById(postId);

    // Check if the post exists
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if the authenticated user is the owner of the post
    if (post.user.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized to edit this post' });
    }

    // Update the post's content
    post.content = content || post.content;

    // Save the updated post
    const updatedPost = await post.save();

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(400).json({ error: 'Error updating post', details: error.message });
  }
};
// Delete Post Controller
exports.deletePost = async (req, res) => {
  const postId = req.params.id;

  try {
    // Find the post by ID
    const post = await Post.findById(postId);

    // Check if the post exists
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if the authenticated user is the owner of the post
    if (post.user.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this post' });
    }

    // Delete the post
    await Post.findByIdAndDelete(postId);

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(400).json({ error: 'Error deleting post', details: error.message });
  }
};
