exports.toggleLike = async (req, res) => {
    const { postId } = req.body;
    try {
      const post = await Post.findById(postId);
      if (post.likes.includes(req.userId)) {
        post.likes.pull(req.userId);
      } else {
        post.likes.push(req.userId);
      }
      await post.save();
      res.json(post);
    } catch (error) {
      res.status(400).json({ error: 'Error toggling like' });
    }
  };