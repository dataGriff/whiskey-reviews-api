const request = require('supertest');
const { app, resetStore, createAdminToken, createReviewerToken, createViewerToken, seedWhiskey } = require('./helpers');

beforeEach(() => resetStore());

describe('Whiskies routes', () => {
  describe('GET /v1/whiskies', () => {
    it('returns empty list when no whiskies exist', async () => {
      const { token } = await createAdminToken();
      const res = await request(app).get('/v1/whiskies').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.pagination.total).toBe(0);
    });

    it('returns list of whiskies', async () => {
      const { token } = await createAdminToken();
      seedWhiskey();
      seedWhiskey({ name: 'Laphroaig 10', distillery: 'Laphroaig' });
      const res = await request(app).get('/v1/whiskies').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination.total).toBe(2);
    });

    it('reviewers can list whiskies', async () => {
      const { token } = await createReviewerToken();
      seedWhiskey();
      const res = await request(app).get('/v1/whiskies').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('viewers can list whiskies', async () => {
      const { token } = await createViewerToken();
      seedWhiskey();
      const res = await request(app).get('/v1/whiskies').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).get('/v1/whiskies');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /v1/whiskies', () => {
    it('adds a whiskey as admin', async () => {
      const { token } = await createAdminToken();
      const res = await request(app).post('/v1/whiskies')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Laphroaig 10', distillery: 'Laphroaig', region: 'Islay', age: 10, description: 'Classic Islay malt.' });
      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.name).toBe('Laphroaig 10');
      expect(res.body.distillery).toBe('Laphroaig');
      expect(res.body.region).toBe('Islay');
      expect(res.body.age).toBe(10);
      expect(res.body.description).toBe('Classic Islay malt.');
      expect(res.body.createdAt).toBeDefined();
      expect(res.body.updatedAt).toBeDefined();
    });

    it('adds a whiskey with null optional fields when omitted', async () => {
      const { token } = await createAdminToken();
      const res = await request(app).post('/v1/whiskies')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Mystery NAS', distillery: 'Unknown' });
      expect(res.status).toBe(201);
      expect(res.body.region).toBeNull();
      expect(res.body.age).toBeNull();
      expect(res.body.description).toBeNull();
    });

    it('returns 403 when reviewer tries to add', async () => {
      const { token } = await createReviewerToken();
      const res = await request(app).post('/v1/whiskies')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Forbidden Dram', distillery: 'Some Distillery' });
      expect(res.status).toBe(403);
    });

    it('returns 403 when viewer tries to add', async () => {
      const { token } = await createViewerToken();
      const res = await request(app).post('/v1/whiskies')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Forbidden Dram', distillery: 'Some Distillery' });
      expect(res.status).toBe(403);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).post('/v1/whiskies')
        .send({ name: 'Dram', distillery: 'Distillery' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /v1/whiskies/:whiskeyId', () => {
    it('returns a whiskey by id', async () => {
      const { token } = await createAdminToken();
      const whiskey = seedWhiskey();
      const res = await request(app).get(`/v1/whiskies/${whiskey.id}`).set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(whiskey.id);
      expect(res.body.name).toBe(whiskey.name);
    });

    it('reviewers can get a whiskey', async () => {
      const { token } = await createReviewerToken();
      const whiskey = seedWhiskey();
      const res = await request(app).get(`/v1/whiskies/${whiskey.id}`).set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(whiskey.id);
    });

    it('viewers can get a whiskey', async () => {
      const { token } = await createViewerToken();
      const whiskey = seedWhiskey();
      const res = await request(app).get(`/v1/whiskies/${whiskey.id}`).set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(whiskey.id);
    });

    it('returns 404 for non-existent whiskey', async () => {
      const { token } = await createAdminToken();
      const res = await request(app)
        .get('/v1/whiskies/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
      expect(res.body.code).toBe('RESOURCE_NOT_FOUND');
    });

    it('returns 401 without token', async () => {
      const res = await request(app).get('/v1/whiskies/00000000-0000-0000-0000-000000000000');
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /v1/whiskies/:whiskeyId', () => {
    it('admin can edit a whiskey', async () => {
      const { token } = await createAdminToken();
      const whiskey = seedWhiskey();
      const res = await request(app).patch(`/v1/whiskies/${whiskey.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'Updated description.' });
      expect(res.status).toBe(200);
      expect(res.body.description).toBe('Updated description.');
    });

    it('returns 403 when reviewer tries to edit', async () => {
      const { token } = await createReviewerToken();
      const whiskey = seedWhiskey();
      const res = await request(app).patch(`/v1/whiskies/${whiskey.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'Forbidden update.' });
      expect(res.status).toBe(403);
    });

    it('returns 403 when viewer tries to edit', async () => {
      const { token } = await createViewerToken();
      const whiskey = seedWhiskey();
      const res = await request(app).patch(`/v1/whiskies/${whiskey.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'Forbidden update.' });
      expect(res.status).toBe(403);
    });

    it('returns 404 for non-existent whiskey', async () => {
      const { token } = await createAdminToken();
      const res = await request(app)
        .patch('/v1/whiskies/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'X' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /v1/whiskies/:whiskeyId', () => {
    it('admin can remove a whiskey', async () => {
      const { token } = await createAdminToken();
      const whiskey = seedWhiskey();
      const res = await request(app).delete(`/v1/whiskies/${whiskey.id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(204);
    });

    it('returns 403 when reviewer tries to remove', async () => {
      const { token } = await createReviewerToken();
      const whiskey = seedWhiskey();
      const res = await request(app).delete(`/v1/whiskies/${whiskey.id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });

    it('returns 403 when viewer tries to remove', async () => {
      const { token } = await createViewerToken();
      const whiskey = seedWhiskey();
      const res = await request(app).delete(`/v1/whiskies/${whiskey.id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });

    it('returns 404 for non-existent whiskey', async () => {
      const { token } = await createAdminToken();
      const res = await request(app)
        .delete('/v1/whiskies/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });
});
