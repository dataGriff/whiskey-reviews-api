const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { store } = require('../store');
const { authenticate, requireRole } = require('../middleware/authenticate');

// GET /whiskies — list all whiskies (any authenticated role)
router.get('/', authenticate, (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize, 10) || 20));
  const all = [...store.whiskies.values()];
  const total = all.length;
  const data = all.slice((page - 1) * pageSize, page * pageSize);
  res.status(200).json({ data, pagination: { page, pageSize, total } });
});

// POST /whiskies — add a whiskey to the inventory (admin only)
router.post('/', authenticate, requireRole('admin'), (req, res) => {
  const { name, distillery, region, age, description } = req.body;
  const now = new Date().toISOString();
  const whiskey = {
    id: uuidv4(),
    name,
    distillery,
    region: region ?? null,
    age: age ?? null,
    description: description ?? null,
    createdAt: now,
    updatedAt: now,
  };
  store.whiskies.set(whiskey.id, whiskey);
  res.status(201).json(whiskey);
});

// GET /whiskies/:whiskeyId — get a single whiskey (any authenticated role)
router.get('/:whiskeyId', authenticate, (req, res) => {
  const whiskey = store.whiskies.get(req.params.whiskeyId);
  if (!whiskey) {
    return res.status(404).json({ code: 'RESOURCE_NOT_FOUND', message: 'Whiskey not found.' });
  }
  res.status(200).json(whiskey);
});

// PATCH /whiskies/:whiskeyId — edit a whiskey (admin only)
// Note: field validation is enforced upstream by the OpenAPI validator middleware.
router.patch('/:whiskeyId', authenticate, requireRole('admin'), (req, res) => {
  const whiskey = store.whiskies.get(req.params.whiskeyId);
  if (!whiskey) {
    return res.status(404).json({ code: 'RESOURCE_NOT_FOUND', message: 'Whiskey not found.' });
  }
  const { name, distillery, region, age, description } = req.body;
  if (name !== undefined) whiskey.name = name;
  if (distillery !== undefined) whiskey.distillery = distillery;
  if (region !== undefined) whiskey.region = region;
  if (age !== undefined) whiskey.age = age;
  if (description !== undefined) whiskey.description = description;
  whiskey.updatedAt = new Date().toISOString();
  store.whiskies.set(whiskey.id, whiskey);
  res.status(200).json(whiskey);
});

// DELETE /whiskies/:whiskeyId — remove a whiskey (admin only)
router.delete('/:whiskeyId', authenticate, requireRole('admin'), (req, res) => {
  const whiskey = store.whiskies.get(req.params.whiskeyId);
  if (!whiskey) {
    return res.status(404).json({ code: 'RESOURCE_NOT_FOUND', message: 'Whiskey not found.' });
  }
  store.whiskies.delete(whiskey.id);
  res.status(204).send();
});

module.exports = router;
