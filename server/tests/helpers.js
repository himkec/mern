import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Post from '../models/Post.js';

export const generateTestToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

export const createTestUser = async (userData = {}) => {
  const defaultUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  };

  const user = await User.create({
    ...defaultUser,
    ...userData
  });

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

  return { user, token };
};

export const createTestPost = async (userId, postData = {}) => {
  const defaultPost = {
    content: 'Test post content',
    media: [{
      url: 'test-image.jpg',
      type: 'image'
    }],
    author: userId
  };

  const post = await Post.create({
    ...defaultPost,
    ...postData
  });

  return post;
};

export const cleanupTestData = async () => {
  await User.deleteMany({});
  await Post.deleteMany({});
}; 