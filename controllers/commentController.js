const Comment = require('../models/coments');

exports.addComment = async (req, res) => {
  const { postId, content } = req.body;
  try {
    const newComment = await Comment.create({ post: postId, user: req.userId, content });
    await Post.findByIdAndUpdate(postId, { $push: { comments: newComment._id } });
    res.status(201).json(newComment);
  } catch (error) {
    res.status(400).json({ error: 'Error adding comment' });
  }
};