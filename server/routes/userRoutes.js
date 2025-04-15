import express from 'express';
import { searchUsers, getUserSuggestions } from '../controllers/userController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Search users
router.get('/search', searchUsers);

// Get user suggestions (requires authentication)
router.get('/suggestions', auth, getUserSuggestions);

export default router; 