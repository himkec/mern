import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = new User({
      username: 'admin02',
      email: 'admin02@example.com',
      password: 'qwerty12345'
    });

    await user.save();
    console.log('User created successfully:', {
      id: user._id,
      email: user.email,
      username: user.username
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

createUser(); 