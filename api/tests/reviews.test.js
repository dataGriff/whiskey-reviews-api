const request = require('supertest');
const { app, resetStore, createReviewerToken, createViewerToken, seedReview } = require('./helpers');

beforeEach(() => resetStore());

describe('Reviews routes', () => {
  describe('GET /v1/reviews', () => {
    it('returns empty list when no reviews exist', async () => {
      const { token } = await createReviewerToken();
      const res = await request(app).get('/v1/reviews').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.pagination.total).toBe(0);
    });

    it('returns list of reviews', async () => {
      const { token, user } = await createReviewerToken();
      seedReview(user.id);
      seedReview(user.id);
      const res = await request(app).get('/v1/reviews').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination.total).toBe(2);
    });

    it('viewers can list reviews', async () => {
      const { user } = await createReviewerToken();
      seedReview(user.id);
      const { token: vToken } = await createViewerToken();
      const res = await request(app).get('/v1/reviews').set('Authorization', `Bearer ${vToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).get('/v1/reviews');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /v1/reviews', () => {
    it('adds a review as reviewer', async () => {
      const { token } = await createReviewerToken();
      const res = await request(app).post('/v1/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({ whiskeyName: 'Laphroaig 10', distillery: 'Laphroaig', region: 'Islay', age: 10, rating: 90, tastingNotes: 'Smoky and peaty' });
      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.whiskeyName).toBe('Laphroaig 10');
      expect(res.body.distillery).toBe('Laphroaig');
      expect(res.body.region).toBe('Islay');
      expect(res.body.age).toBe(10);
      expect(res.body.rating).toBe(90);
      expect(res.body.tastingNotes).toBe('Smoky and peaty');
      expect(res.body.status).toBe('published');
      expect(res.body.reviewerId).toBeDefined();
      expect(res.body.createdAt).toBeDefined();
      expect(res.body.updatedAt).toBeDefined();
    });

    it('adds a review with null optional fields when omitted', async () => {
      const { token } = await createReviewerToken();
      const res = await request(app).post('/v1/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({ whiskeyName: 'Mystery Dram', distillery: 'Unknown', rating: 75 });
      expect(res.status).toBe(201);
      expect(res.body.region).toBeNull();
      expect(res.body.age).toBeNull();
      expect(res.body.tastingNotes).toBeNull();
    });

    it('returns 403 when viewer tries to add', async () => {
      const { token } = await createViewerToken();
      const res = await request(app).post('/v1/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({ whiskeyName: 'Viewer Dram', distillery: 'Some Distillery', rating: 70 });
      expect(res.status).toBe(403);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).post('/v1/reviews')
        .send({ whiskeyName: 'Dram', distillery: 'Distillery', rating: 80 });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /v1/reviews/:reviewId', () => {
    it('returns a review by id', async () => {
      const { token, user } = await createReviewerToken();
      const review = seedReview(user.id);
      const res = await request(app).get(`/v1/reviews/${review.id}`).set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(review.id);
      expect(res.body.whiskeyName).toBe(review.whiskeyName);
    });

    it('viewers can get a review', async () => {
      const { user } = await createReviewerToken();
      const review = seedReview(user.id);
      const { token: vToken } = await createViewerToken();
      const res = await request(app).get(`/v1/reviews/${review.id}`).set('Authorization', `Bearer ${vToken}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(review.id);
    });

    it('returns 404 for non-existent review', async () => {
      const { token } = await createReviewerToken();
      const res = await request(app)
        .get('/v1/reviews/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
      expect(res.body.code).toBe('RESOURCE_NOT_FOUND');
    });

    it('returns 401 without token', async () => {
      const res = await request(app).get('/v1/reviews/00000000-0000-0000-0000-000000000000');
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /v1/reviews/:reviewId', () => {
    it('reviewer can edit their own review', async () => {
      const { token, user } = await createReviewerToken();
      const review = seedReview(user.id);
      const res = await request(app).patch(`/v1/reviews/${review.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 92, status: 'archived' });
      expect(res.status).toBe(200);
      expect(res.body.rating).toBe(92);
      expect(res.body.status).toBe('archived');
    });

    it('returns 403 when editing another reviewer\'s review', async () => {
      const { user: creator } = await createReviewerToken();
      const review = seedReview(creator.id);
      const { token: otherToken } = await createReviewerToken();
      const res = await request(app).patch(`/v1/reviews/${review.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ rating: 50 });
      expect(res.status).toBe(403);
    });

    it('returns 403 when viewer tries to edit', async () => {
      const { user } = await createReviewerToken();
      const review = seedReview(user.id);
      const { token: vToken } = await createViewerToken();
      const res = await request(app).patch(`/v1/reviews/${review.id}`)
        .set('Authorization', `Bearer ${vToken}`)
        .send({ rating: 60 });
      expect(res.status).toBe(403);
    });

    it('returns 404 for non-existent review', async () => {
      const { token } = await createReviewerToken();
      const res = await request(app)
        .patch('/v1/reviews/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 80 });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /v1/reviews/:reviewId', () => {
    it('reviewer can remove their own review', async () => {
      const { token, user } = await createReviewerToken();
      const review = seedReview(user.id);
      const res = await request(app).delete(`/v1/reviews/${review.id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(204);
    });

    it('returns 403 when removing another reviewer\'s review', async () => {
      const { user: creator } = await createReviewerToken();
      const review = seedReview(creator.id);
      const { token: otherToken } = await createReviewerToken();
      const res = await request(app).delete(`/v1/reviews/${review.id}`)
        .set('Authorization', `Bearer ${otherToken}`);
      expect(res.status).toBe(403);
    });

    it('returns 403 when viewer tries to remove', async () => {
      const { user } = await createReviewerToken();
      const review = seedReview(user.id);
      const { token: vToken } = await createViewerToken();
      const res = await request(app).delete(`/v1/reviews/${review.id}`)
        .set('Authorization', `Bearer ${vToken}`);
      expect(res.status).toBe(403);
    });

    it('returns 404 for non-existent review', async () => {
      const { token } = await createReviewerToken();
      const res = await request(app)
        .delete('/v1/reviews/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });
});
