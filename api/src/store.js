const { v4: uuidv4 } = require('uuid');

let store = {
  users: new Map(),
  reviews: new Map(),
};

function resetStore() {
  store.users = new Map();
  store.reviews = new Map();
}

module.exports = { store, resetStore };
