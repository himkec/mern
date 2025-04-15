import express from 'express';
import { auth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment
} from '../controllers/postController.js';

const router = express.Router();

// Create a new post with media upload
router.post('/', auth, upload.array('media', 4), createPost);

// Get all posts with pagination
router.get('/', getPosts);

// Get a single post
router.get('/:id', getPost);

// Update a post
router.put('/:id', auth, upload.array('media', 4), updatePost);

// Delete a post
router.delete('/:id', auth, deletePost);

// Like/unlike a post
router.post('/:id/like', auth, toggleLike);

// Add a comment to a post
router.post('/:id/comments', auth, addComment);

// Delete a comment
router.delete('/:id/comments/:commentId', auth, deleteComment);

export default router; 