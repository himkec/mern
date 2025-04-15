import User from '../models/User.js';

// Search users by username or email
export const searchUsers = async (req, res) => {
  try {
    const searchQuery = req.query.q || req.query.query;
    
    if (!searchQuery) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } }
      ]
    })
    .select('username email profilePicture bio')
    .limit(10);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error searching users', error: error.message });
  }
};

// Get user suggestions (for follow recommendations)
export const getUserSuggestions = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    
    // Get users that the current user is not following
    const suggestions = await User.find({
      _id: { 
        $nin: [...(currentUser.following || []), currentUser._id] 
      }
    })
    .select('username profilePicture bio')
    .limit(5);

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: 'Error getting user suggestions', error: error.message });
  }
}; 