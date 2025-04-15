import User from '../models/User.js';

// Get current user's profile
export const getCurrentUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
};

// Get user profile by ID
export const getUserProfile = async (req, res) => {
  try {
    if (!req.params.userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { username, bio, location, profilePicture } = req.body;
    
    // Check if username is already taken by another user
    if (username) {
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: req.user._id } 
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { 
        $set: { 
          username, 
          bio, 
          location, 
          profilePicture 
        } 
      },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

// Follow a user
export const followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.userId);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const currentUser = await User.findById(req.user._id);
    
    // Check if already following
    if (currentUser.following.includes(req.params.userId)) {
      return res.status(400).json({ message: 'Already following this user' });
    }
    
    // Update current user's following list
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { following: req.params.userId } }
    );
    
    // Update target user's followers list
    await User.findByIdAndUpdate(
      req.params.userId,
      { $push: { followers: req.user._id } }
    );
    
    res.json({ message: 'Successfully followed user' });
  } catch (error) {
    res.status(500).json({ message: 'Error following user', error: error.message });
  }
};

// Unfollow a user
export const unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.userId);
    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update current user's following list
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { following: req.params.userId } }
    );
    
    // Update target user's followers list
    await User.findByIdAndUpdate(
      req.params.userId,
      { $pull: { followers: req.user._id } }
    );
    
    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    res.status(500).json({ message: 'Error unfollowing user', error: error.message });
  }
}; 