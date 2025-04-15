import mongoose from 'mongoose';
import request from 'supertest';
import { jest } from '@jest/globals';
import app from '../server.js';
import User from '../models/User.js';

describe('Search API', () => {
  let token;
  let testUser;
  let testUsers;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/mern_test?authSource=admin');
    
    // Create a test user
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });

    // Create multiple test users for search
    testUsers = await User.create([
      {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'password123',
        bio: 'Test bio for John'
      },
      {
        username: 'jane_doe',
        email: 'jane@example.com',
        password: 'password123',
        bio: 'Test bio for Jane'
      },
      {
        username: 'bob_smith',
        email: 'bob@test.com',
        password: 'password123',
        bio: 'Test bio for Bob'
      }
    ]);

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
    await mongoose.connection.close();
  });

  describe('GET /api/users/search', () => {
    it('should search users by username', async () => {
      const response = await request(app)
        .get('/api/users/search')
        .query({ query: 'doe' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body.map(user => user.username)).toContain('john_doe');
      expect(response.body.map(user => user.username)).toContain('jane_doe');
    });

    it('should search users by email', async () => {
      const response = await request(app)
        .get('/api/users/search')
        .query({ query: 'test.com' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body.map(user => user.email)).toContain('test@example.com');
      expect(response.body.map(user => user.email)).toContain('bob@test.com');
    });

    it('should return 400 if no query is provided', async () => {
      const response = await request(app)
        .get('/api/users/search');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Search query is required');
    });

    it('should return empty array for no matches', async () => {
      const response = await request(app)
        .get('/api/users/search')
        .query({ query: 'nonexistent' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('GET /api/users/suggestions', () => {
    it('should get user suggestions for authenticated user', async () => {
      const response = await request(app)
        .get('/api/users/suggestions')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(5);
      
      // Should not include the current user
      expect(response.body.map(user => user._id)).not.toContain(testUser._id.toString());
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/users/suggestions');

      expect(response.status).toBe(401);
    });
  });
}); 