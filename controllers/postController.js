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

// Set up Cloudinary configuration
cloudinary.config({
  cloud_name: 'dyqmr5gxd',
  api_key: '132426531318371',
  api_secret: 'qTQgV3KCcKcq5Wyfwb3MH3YuAuI',
});

exports.createPost = async (req, res) => {
  const { content } = req.body;
  const { file } = req.files; // Assuming you're using `express-fileupload` or similar

  // Debugging log to verify data
  console.log('Received content:', content);
  console.log('Received file:', file);

  if (!file) {
    console.error('No file uploaded');
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Upload the file to Cloudinary
    const uploadedImage = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'posts',
    });

    console.log('Cloudinary Upload Success:', uploadedImage); // Debugging log

    // Save the post with the image URL
    const newPost = await Post.create({
      user: req.userId,
      content,
      imageUrl: uploadedImage.secure_url, // Cloudinary URL
    });

    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error); // Detailed error log
    res.status(500).json({ error: 'Error creating post', details: error.message });
  }
};
