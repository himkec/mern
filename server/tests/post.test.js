import mongoose from 'mongoose';
import request from 'supertest';
import { jest } from '@jest/globals';
import app from '../server.js';
import Post from '../models/Post.js';
import User from '../models/User.js';

describe('Post API', () => {
  let token;
  let testUser;
  let testPost;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/mern_test?authSource=admin');
    
    // Create a test user
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });

    // Get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    token = loginResponse.body.token;
  });

  afterAll(async () => {
    // Clean up
    await User.deleteMany({});
    await Post.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Create a test post before each test
    testPost = await Post.create({
      content: 'Test post content',
      author: testUser._id
    });
  });

  afterEach(async () => {
    // Clean up posts after each test
    await Post.deleteMany({});
  });

  describe('POST /api/posts', () => {
    it('should create a new post', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'New test post'
        });

      expect(response.status).toBe(201);
      expect(response.body.content).toBe('New test post');
      expect(response.body.author._id.toString()).toBe(testUser._id.toString());
    });

    it('should not create a post without content', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Post must contain either content or media');
    });
  });

  describe('GET /api/posts', () => {
    it('should get all posts with pagination', async () => {
      // Create multiple posts for pagination testing
      await Post.create([
        { content: 'Post 1', author: testUser._id },
        { content: 'Post 2', author: testUser._id },
        { content: 'Post 3', author: testUser._id }
      ]);

      const response = await request(app)
        .get('/api/posts')
        .query({ page: 1, limit: 2 });

      expect(response.status).toBe(200);
      expect(response.body.posts.length).toBe(2);
      expect(response.body.currentPage).toBe(1);
      expect(response.body.hasMore).toBe(true);
    });

    it('should get a single post by ID', async () => {
      const response = await request(app)
        .get(`/api/posts/${testPost._id}`);

      expect(response.status).toBe(200);
      expect(response.body._id.toString()).toBe(testPost._id.toString());
      expect(response.body.content).toBe(testPost.content);
    });
  });

  describe('PUT /api/posts/:id', () => {
    it('should update a post', async () => {
      const response = await request(app)
        .put(`/api/posts/${testPost._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'Updated content'
        });

      expect(response.status).toBe(200);
      expect(response.body.content).toBe('Updated content');
    });

    it('should not update a post without authorization', async () => {
      const response = await request(app)
        .put(`/api/posts/${testPost._id}`)
        .send({
          content: 'Updated content'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should delete a post', async () => {
      const response = await request(app)
        .delete(`/api/posts/${testPost._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Post deleted successfully');

      const deletedPost = await Post.findById(testPost._id);
      expect(deletedPost).toBeNull();
    });

    it('should not delete a post without authorization', async () => {
      const response = await request(app)
        .delete(`/api/posts/${testPost._id}`);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/posts/:id/like', () => {
    it('should toggle like on a post', async () => {
      const response = await request(app)
        .post(`/api/posts/${testPost._id}/like`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.likes).toContain(testUser._id.toString());

      // Toggle like off
      const secondResponse = await request(app)
        .post(`/api/posts/${testPost._id}/like`)
        .set('Authorization', `Bearer ${token}`);

      expect(secondResponse.status).toBe(200);
      expect(secondResponse.body.likes).not.toContain(testUser._id.toString());
    });
  });

  describe('POST /api/posts/:id/comments', () => {
    it('should add a comment to a post', async () => {
      const response = await request(app)
        .post(`/api/posts/${testPost._id}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'Test comment'
        });

      expect(response.status).toBe(200);
      expect(response.body.comments[0].content).toBe('Test comment');
      expect(response.body.comments[0].user.toString()).toBe(testUser._id.toString());
    });
  });
}); 