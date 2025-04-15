import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const createUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mern_app');
    
    const userData = {
      username: 'findme',
      email: 'findme@example.com',
      password: 'qwerty12345'
    };

    const user = await User.create(userData);
    console.log('User created successfully:', {
      id: user._id,
      username: user.username,
      email: user.email
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error creating user:', error);
    process.exit(1);
  }
};

createUser(); 