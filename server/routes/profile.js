import express from 'express';
import { 
  getUserProfile, 
  updateProfile, 
  followUser, 
  unfollowUser 
} from '../controllers/profileController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/:userId', getUserProfile);

// Protected routes
router.put('/update', auth, updateProfile);
router.post('/follow/:userId', auth, followUser);
router.post('/unfollow/:userId', auth, unfollowUser);

export default router; 