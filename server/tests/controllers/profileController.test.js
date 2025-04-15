import request from 'supertest';
import app from '../../app.js';
import { createTestUser, cleanupTestData } from '../helpers.js';

describe('Profile Controller', () => {
  let testUser;
  let testToken;

  beforeEach(async () => {
    // Create a test user and get their token
    const result = await createTestUser();
    testUser = result.user;
    testToken = result.token;
  });

  afterEach(async () => {
    // Clean up test data
    await cleanupTestData();
  });

  describe('GET /api/profile', () => {
    it('should get current user profile when authenticated', async () => {
      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('username', testUser.username);
      expect(response.body).toHaveProperty('email', testUser.email);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/profile');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/profile', () => {
    it('should update profile when authenticated', async () => {
      const updateData = {
        username: 'updateduser',
        bio: 'Test bio',
        location: 'Test location'
      };

      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${testToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('username', updateData.username);
      expect(response.body).toHaveProperty('bio', updateData.bio);
      expect(response.body).toHaveProperty('location', updateData.location);
    });

    it('should return 401 when not authenticated', async () => {
      const updateData = {
        username: 'updateduser',
        bio: 'Test bio'
      };

      const response = await request(app)
        .put('/api/profile')
        .send(updateData);

      expect(response.status).toBe(401);
    });

    it('should return 400 when username is already taken', async () => {
      // Create another user first
      await createTestUser({
        username: 'existinguser',
        email: 'existing@example.com'
      });

      const updateData = {
        username: 'existinguser'
      };

      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${testToken}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Username already exists');
    });
  });
}); 