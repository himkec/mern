import request from 'supertest';
import app from '../../app.js';
import { createTestUser, createTestPost, cleanupTestData } from '../helpers.js';

describe('Post Controller', () => {
  let testUser;
  let testToken;
  let testPost;

  beforeEach(async () => {
    // Create a test user and get their token
    const result = await createTestUser();
    testUser = result.user;
    testToken = result.token;

    // Create a test post
    testPost = await createTestPost(testUser._id);
  });

  afterEach(async () => {
    // Clean up test data
    await cleanupTestData();
  });

  describe('POST /api/posts', () => {
    it('should create a new post when authenticated', async () => {
      const postData = {
        content: 'Test post content',
        media: [{
          url: 'test-image.jpg',
          type: 'image'
        }]
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${testToken}`)
        .send(postData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('content', postData.content);
      expect(response.body).toHaveProperty('media');
      expect(response.body.media[0]).toHaveProperty('url', postData.media[0].url);
      expect(response.body.media[0]).toHaveProperty('type', postData.media[0].type);
      expect(response.body).toHaveProperty('author', testUser._id.toString());
    });

    it('should return 401 when not authenticated', async () => {
      const postData = {
        content: 'Test post content',
        media: ['test-image.jpg']
      };

      const response = await request(app)
        .post('/api/posts')
        .send(postData);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/posts', () => {
    it('should get all posts', async () => {
      const response = await request(app)
        .get('/api/posts')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('content');
      expect(response.body[0]).toHaveProperty('media');
      expect(response.body[0]).toHaveProperty('user');
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should delete a post when user is the owner', async () => {
      const response = await request(app)
        .delete(`/api/posts/${testPost._id}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Post deleted successfully');
    });

    it('should return 404 when post does not exist', async () => {
      const response = await request(app)
        .delete('/api/posts/123456789012')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 403 when user is not the owner', async () => {
      // Create another user
      const otherUser = await createTestUser({
        username: 'otheruser',
        email: 'other@example.com'
      });

      const response = await request(app)
        .delete(`/api/posts/${testPost._id}`)
        .set('Authorization', `Bearer ${otherUser.token}`);

      expect(response.status).toBe(403);
    });
  });
}); 