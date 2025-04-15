import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const updateProfilePictures = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mern_app');
    console.log('Connected to MongoDB');

    // Find all users with the old placeholder URL
    const users = await User.find({
      profilePicture: 'https://via.placeholder.com/150'
    });

    console.log(`Found ${users.length} users with old placeholder URL`);

    // Update each user with the new UI Avatars URL
    for (const user of users) {
      const newProfilePicture = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random&color=fff&size=150`;
      await User.findByIdAndUpdate(user._id, { profilePicture: newProfilePicture });
      console.log(`Updated user ${user.username}`);
    }

    console.log('All users updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating users:', error);
    process.exit(1);
  }
};

updateProfilePictures(); 