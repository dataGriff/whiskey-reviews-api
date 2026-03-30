const request = require('supertest');
const { app, resetStore, createAdminToken, createReviewerToken, createViewerToken, seedWhiskey, seedReview } = require('./helpers');

beforeEach(() => resetStore());

describe('Contract Tests - Response Shapes', () => {
  describe('Auth endpoints', () => {
    it('POST /v1/auth/register returns 201 with AuthResponse shape', async () => {
      const res = await request(app)
        .post('/v1/auth/register')
        .send({ email: 'test@example.com', password: 'password123', firstName: 'Test', lastName: 'User', role: 'reviewer' });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body).toHaveProperty('expiresIn');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user).toHaveProperty('email');
      expect(res.body.user).toHaveProperty('firstName');
      expect(res.body.user).toHaveProperty('lastName');
      expect(res.body.user).toHaveProperty('role');
    });

    it('POST /v1/auth/login returns 200 with AuthResponse shape', async () => {
      await request(app).post('/v1/auth/register')
        .send({ email: 'test2@example.com', password: 'password123', firstName: 'T', lastName: 'U', role: 'viewer' });
      const res = await request(app).post('/v1/auth/login')
        .send({ email: 'test2@example.com', password: 'password123' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body).toHaveProperty('expiresIn');
      expect(res.body.user).toHaveProperty('id');
    });

    it('POST /v1/auth/logout returns 204', async () => {
      const { token } = await createReviewerToken();
      const res = await request(app).post('/v1/auth/logout').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(204);
    });

    it('POST /v1/auth/refresh returns 200 with AuthResponse shape', async () => {
      const regRes = await request(app).post('/v1/auth/register')
        .send({ email: 'refresh@example.com', password: 'password123', firstName: 'R', lastName: 'T', role: 'reviewer' });
      const res = await request(app).post('/v1/auth/refresh')
        .send({ refreshToken: regRes.body.refreshToken });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });
  });

  describe('Whiskey endpoints', () => {
    it('GET /v1/whiskies returns 200 with WhiskeyList shape', async () => {
      const { token } = await createAdminToken();
      const res = await request(app).get('/v1/whiskies').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('pagination');
      expect(res.body.pagination).toHaveProperty('page');
      expect(res.body.pagination).toHaveProperty('pageSize');
      expect(res.body.pagination).toHaveProperty('total');
    });

    it('POST /v1/whiskies returns 201 with Whiskey shape', async () => {
      const { token } = await createAdminToken();
      const res = await request(app).post('/v1/whiskies')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Glenfiddich 12', distillery: 'Glenfiddich' });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name', 'Glenfiddich 12');
      expect(res.body).toHaveProperty('distillery', 'Glenfiddich');
      expect(res.body).toHaveProperty('region', null);
      expect(res.body).toHaveProperty('age', null);
      expect(res.body).toHaveProperty('description', null);
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).toHaveProperty('updatedAt');
    });

    it('GET /v1/whiskies/:whiskeyId returns 200 with Whiskey shape', async () => {
      const { token } = await createAdminToken();
      const whiskey = seedWhiskey();
      const res = await request(app).get(`/v1/whiskies/${whiskey.id}`).set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', whiskey.id);
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('distillery');
    });

    it('PATCH /v1/whiskies/:whiskeyId returns 200 with edited Whiskey shape', async () => {
      const { token } = await createAdminToken();
      const whiskey = seedWhiskey();
      const res = await request(app).patch(`/v1/whiskies/${whiskey.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'Updated description.' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('description', 'Updated description.');
      expect(res.body).toHaveProperty('updatedAt');
    });

    it('DELETE /v1/whiskies/:whiskeyId returns 204', async () => {
      const { token } = await createAdminToken();
      const whiskey = seedWhiskey();
      const res = await request(app).delete(`/v1/whiskies/${whiskey.id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(204);
    });
  });

  describe('Review endpoints', () => {
    it('GET /v1/reviews returns 200 with ReviewList shape', async () => {
      const { token } = await createReviewerToken();
      const res = await request(app).get('/v1/reviews').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('pagination');
      expect(res.body.pagination).toHaveProperty('page');
      expect(res.body.pagination).toHaveProperty('pageSize');
      expect(res.body.pagination).toHaveProperty('total');
    });

    it('POST /v1/reviews returns 201 with Review shape', async () => {
      const { token } = await createReviewerToken();
      const whiskey = seedWhiskey();
      const res = await request(app).post('/v1/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({ whiskeyId: whiskey.id, rating: 85 });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('whiskeyId', whiskey.id);
      expect(res.body).toHaveProperty('rating', 85);
      expect(res.body).toHaveProperty('tastingNotes', null);
      expect(res.body).toHaveProperty('status', 'published');
      expect(res.body).toHaveProperty('reviewerId');
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).toHaveProperty('updatedAt');
    });

    it('GET /v1/reviews/:reviewId returns 200 with Review shape', async () => {
      const { token, user } = await createReviewerToken();
      const whiskey = seedWhiskey();
      const review = seedReview(user.id, whiskey.id);
      const res = await request(app).get(`/v1/reviews/${review.id}`).set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', review.id);
      expect(res.body).toHaveProperty('whiskeyId', whiskey.id);
      expect(res.body).toHaveProperty('rating');
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('reviewerId');
    });

    it('PATCH /v1/reviews/:reviewId returns 200 with edited Review shape', async () => {
      const { token, user } = await createReviewerToken();
      const whiskey = seedWhiskey();
      const review = seedReview(user.id, whiskey.id);
      const res = await request(app).patch(`/v1/reviews/${review.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 90, status: 'archived' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('rating', 90);
      expect(res.body).toHaveProperty('status', 'archived');
      expect(res.body).toHaveProperty('updatedAt');
    });

    it('DELETE /v1/reviews/:reviewId returns 204', async () => {
      const { token, user } = await createReviewerToken();
      const whiskey = seedWhiskey();
      const review = seedReview(user.id, whiskey.id);
      const res = await request(app).delete(`/v1/reviews/${review.id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(204);
    });
  });

  describe('Error responses', () => {
    it('returns 401 when no token provided', async () => {
      const res = await request(app).get('/v1/reviews');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('code');
      expect(res.body).toHaveProperty('message');
    });

    it('returns 403 when viewer accesses reviewer-only endpoint', async () => {
      const { token } = await createViewerToken();
      const whiskey = seedWhiskey();
      const res = await request(app).post('/v1/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({ whiskeyId: whiskey.id, rating: 70 });
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('code');
    });

    it('returns 403 when reviewer accesses admin-only endpoint', async () => {
      const { token } = await createReviewerToken();
      const res = await request(app).post('/v1/whiskies')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Forbidden Dram', distillery: 'Forbidden Distillery' });
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('code');
    });

    it('returns 404 for non-existent resource', async () => {
      const { token } = await createReviewerToken();
      const res = await request(app)
        .get('/v1/reviews/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('code', 'RESOURCE_NOT_FOUND');
    });

    it('returns 409 for duplicate email on register', async () => {
      await request(app).post('/v1/auth/register')
        .send({ email: 'dup@example.com', password: 'password123', firstName: 'D', lastName: 'U', role: 'reviewer' });
      const res = await request(app).post('/v1/auth/register')
        .send({ email: 'dup@example.com', password: 'password123', firstName: 'D', lastName: 'U', role: 'reviewer' });
      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty('code', 'DUPLICATE_EMAIL');
    });
  });
});
