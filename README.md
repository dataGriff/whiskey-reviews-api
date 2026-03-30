# whiskey-reviews-api

A spec-driven, contract-first **Whiskey Reviews REST API** built with Node.js/Express.

An admin-curated whiskey inventory lets admins manage whiskies; reviewers submit tasting reviews for whiskies in the inventory; viewers browse both.

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

- **Roles:** `admin` (manage inventory) · `reviewer` (write own reviews) · `viewer` (read-only)
- **Resources:**
  - `/v1/whiskies` — whiskey inventory (admin writes, all reads)
  - `/v1/reviews` — tasting reviews linked to a whiskey by `whiskeyId` (reviewer writes, all reads)
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
