exports.toggleLike = async (req, res) => {
    const { postId, userId } = req.body; // Expect postId and userId from the request body
    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.likes.includes(userId)) {
            // If user already liked, remove the like
            post.likes = post.likes.filter(id => id.toString() !== userId);
        } else {
            // Otherwise, add the like
            post.likes.push(userId);
        }

        await post.save();
        res.status(200).json({
            message: `Post ${post.likes.includes(userId) ? 'liked' : 'unliked'} successfully`,
            likes: post.likes.length,
            post,
        });
    } catch (error) {
        res.status(500).json({ error: 'Error toggling like', details: error.message });
    }
};
