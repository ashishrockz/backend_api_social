const Post = require('../models/Post');

exports.toggleLike = async (req, res) => {
    const { postId } = req.body; // Expect postId in the request body
    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.likes.includes(req.userId)) {
            // If user already liked, remove the like
            post.likes = post.likes.filter(id => id.toString() !== req.userId);
        } else {
            // Otherwise, add the like
            post.likes.push(req.userId);
        }

        await post.save();
        res.status(200).json({
            message: `Post ${post.likes.includes(req.userId) ? 'liked' : 'unliked'} successfully`,
            likes: post.likes.length,
            post,
        });
    } catch (error) {
        res.status(500).json({ error: 'Error toggling like', details: error.message });
    }
};
