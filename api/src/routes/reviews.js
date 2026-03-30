const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { store } = require('../store');
const { authenticate, requireRole } = require('../middleware/authenticate');

// GET /reviews — list all reviews (any authenticated role)
router.get('/', authenticate, (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize, 10) || 20));
  const all = [...store.reviews.values()];
  const total = all.length;
  const data = all.slice((page - 1) * pageSize, page * pageSize);
  res.status(200).json({ data, pagination: { page, pageSize, total } });
});

// POST /reviews — add a review (reviewer only)
router.post('/', authenticate, requireRole('reviewer'), (req, res) => {
  const { whiskeyName, distillery, region, age, rating, tastingNotes } = req.body;
  const now = new Date().toISOString();
  const review = {
    id: uuidv4(),
    whiskeyName,
    distillery,
    region: region ?? null,
    age: age ?? null,
    rating,
    tastingNotes: tastingNotes ?? null,
    status: 'published',
    reviewerId: req.user.sub,
    createdAt: now,
    updatedAt: now,
  };
  store.reviews.set(review.id, review);
  res.status(201).json(review);
});

// GET /reviews/:reviewId — get a single review (any authenticated role)
router.get('/:reviewId', authenticate, (req, res) => {
  const review = store.reviews.get(req.params.reviewId);
  if (!review) {
    return res.status(404).json({ code: 'RESOURCE_NOT_FOUND', message: 'Review not found.' });
  }
  res.status(200).json(review);
});

// PATCH /reviews/:reviewId — edit a review (reviewer, own only)
// Note: field validation (e.g. status enum, rating range) is enforced upstream by the OpenAPI validator middleware.
router.patch('/:reviewId', authenticate, requireRole('reviewer'), (req, res) => {
  const review = store.reviews.get(req.params.reviewId);
  if (!review) {
    return res.status(404).json({ code: 'RESOURCE_NOT_FOUND', message: 'Review not found.' });
  }
  if (review.reviewerId !== req.user.sub) {
    return res.status(403).json({ code: 'FORBIDDEN', message: 'You can only edit your own reviews.' });
  }
  const { whiskeyName, distillery, region, age, rating, tastingNotes, status } = req.body;
  if (whiskeyName !== undefined) review.whiskeyName = whiskeyName;
  if (distillery !== undefined) review.distillery = distillery;
  if (region !== undefined) review.region = region;
  if (age !== undefined) review.age = age;
  if (rating !== undefined) review.rating = rating;
  if (tastingNotes !== undefined) review.tastingNotes = tastingNotes;
  if (status !== undefined) review.status = status;
  review.updatedAt = new Date().toISOString();
  store.reviews.set(review.id, review);
  res.status(200).json(review);
});

// DELETE /reviews/:reviewId — remove a review (reviewer, own only)
router.delete('/:reviewId', authenticate, requireRole('reviewer'), (req, res) => {
  const review = store.reviews.get(req.params.reviewId);
  if (!review) {
    return res.status(404).json({ code: 'RESOURCE_NOT_FOUND', message: 'Review not found.' });
  }
  if (review.reviewerId !== req.user.sub) {
    return res.status(403).json({ code: 'FORBIDDEN', message: 'You can only remove your own reviews.' });
  }
  store.reviews.delete(review.id);
  res.status(204).send();
});

module.exports = router;
