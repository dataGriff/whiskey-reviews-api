const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { store, resetStore } = require('../src/store');
const { signAccessToken } = require('../src/auth');
const app = require('../src/app');

async function createUser(email, password, firstName, lastName, role) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = uuidv4();
  const now = new Date().toISOString();
  const user = { id: userId, email, password: hashedPassword, firstName, lastName, role, createdAt: now };
  store.users.set(userId, user);
  return user;
}

function tokenForUser(user) {
  return signAccessToken({ sub: user.id, email: user.email, role: user.role });
}

async function createAdminToken(overrides = {}) {
  const email = overrides.email || `admin-${uuidv4()}@test.com`;
  const user = await createUser(email, 'password123', 'Test', 'Admin', 'admin');
  return { token: tokenForUser(user), user };
}

async function createReviewerToken(overrides = {}) {
  const email = overrides.email || `reviewer-${uuidv4()}@test.com`;
  const user = await createUser(email, 'password123', 'Test', 'Reviewer', 'reviewer');
  return { token: tokenForUser(user), user };
}

async function createViewerToken(overrides = {}) {
  const email = overrides.email || `viewer-${uuidv4()}@test.com`;
  const user = await createUser(email, 'password123', 'Test', 'Viewer', 'viewer');
  return { token: tokenForUser(user), user };
}

function seedWhiskey(overrides = {}) {
  const now = new Date().toISOString();
  const whiskey = {
    id: uuidv4(),
    name: 'Glenfiddich 12',
    distillery: 'Glenfiddich',
    region: 'Speyside',
    age: 12,
    description: 'A classic Speyside single malt.',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
  store.whiskies.set(whiskey.id, whiskey);
  return whiskey;
}

function seedReview(reviewerId, whiskeyId, overrides = {}) {
  const now = new Date().toISOString();
  const review = {
    id: uuidv4(),
    whiskeyId,
    rating: 85,
    tastingNotes: 'Fruity with hints of pear and oak.',
    status: 'published',
    reviewerId,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
  store.reviews.set(review.id, review);
  return review;
}

module.exports = {
  app,
  store,
  resetStore,
  createUser,
  createAdminToken,
  createReviewerToken,
  createViewerToken,
  seedWhiskey,
  seedReview,
  tokenForUser,
};
