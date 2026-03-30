# whiskey-reviews-api

A spec-driven, contract-first **Whiskey Reviews REST API** built with Node.js/Express.

Reviewers can add, edit, and remove their own whiskey tasting reviews. Viewers can browse and read all published reviews.

> **Full documentation:** [`docs/index.md`](docs/index.md)

---

## Quick Start

```bash
task api:install   # install dependencies
task api:test      # run all tests
task domain:check  # lint contracts + run all tests
task api:demo      # run the full end-to-end demo
```

---

## Domain

- **Roles:** `reviewer` (write own reviews) · `viewer` (read-only)
- **Resource:** `/v1/reviews` — whiskey tasting reviews with distillery, region, age, rating, and tasting notes
- **Auth:** JWT Bearer tokens — register at `POST /v1/auth/register`, log in at `POST /v1/auth/login`

---

## Architecture

| Layer | Location |
|-------|----------|
| Entry point | `api/src/server.js` |
| App config | `api/src/app.js` |
| Auth utilities | `api/src/auth.js` |
| Routes | `api/src/routes/` |
| In-memory store | `api/src/store.js` |
| Tests | `api/tests/` |
| Specs | `docs/specifications/` |
