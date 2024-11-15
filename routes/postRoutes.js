const express = require('express');
const router = express.Router();
const { createPost, getUserPosts,getPosts } = require('../controllers/postController');
const verifyToken = require('../middleware/auth');

router.post('/', verifyToken, createPost);
router.get('/user', verifyToken, getUserPosts);
router.get('/user', verifyToken, getPosts);

module.exports = router;
