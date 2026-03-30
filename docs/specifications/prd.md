# Product Requirements Document — Whiskey Reviews

---

## Problem Statement

Whiskey enthusiasts need a dedicated API to record, share, and browse whiskey tasting reviews. An admin-curated inventory of whiskies provides a canonical catalogue; reviewers submit tasting reviews against entries in that catalogue, while viewers browse both whiskies and reviews.

**Business:** Whiskey Reviews API — a community-driven whiskey review platform backed by a curated inventory.

## Target Users / Personas

### Admin

A whiskey administrator who curates the whiskey inventory.

- **Goal:** Maintain an accurate, up-to-date catalogue of whiskies.
- **Frustration:** Duplicate or inaccurate whiskey entries submitted by reviewers.

### Reviewer

A whiskey enthusiast who tastes and writes reviews for whiskies in the inventory.

- **Goal:** Record detailed tasting notes and ratings for whiskies, and keep their reviews up to date.
- **Frustration:** No structured way to link a personal rating to the canonical whiskey entry.

### Viewer

A user who browses the whiskey inventory and reads reviews without contributing.

- **Goal:** Discover new whiskies and read expert tasting notes.
- **Frustration:** Reviews edited or removed by others without their knowledge.

## Goals

1. Provide an admin-curated whiskey inventory with full CRUD access for admins.
2. Allow reviewers to submit tasting reviews linked to whiskies in the inventory.
3. Support pagination on all list endpoints.
4. Enforce role-based access control (admin, reviewer, viewer).

## Non-Goals

1. Persistent storage — the in-memory store resets on restart.
2. Social features (likes, comments, follows).

## User Stories

### Authentication

#### US-001: Register as an admin, reviewer, or viewer

**As a** new user,
**I want to** register with an email, password, and role,
**So that** I can access the API.

**Acceptance Criteria:**
- [x] POST /v1/auth/register accepts `admin`, `reviewer`, or `viewer` role
- [x] Returns access token + refresh token on success
- [x] Returns 409 if email already registered

#### US-002: Log in and receive tokens

**As a** registered user,
**I want to** log in with my email and password,
**So that** I can get a fresh access token.

**Acceptance Criteria:**
- [x] POST /v1/auth/login returns 200 with tokens on valid credentials
- [x] Returns 401 on invalid credentials

### Whiskey Inventory

#### US-003: Add a whiskey to the inventory

**As an** admin,
**I want to** add a new whiskey with its name, distillery, and other details,
**So that** reviewers can submit reviews for it.

**Acceptance Criteria:**
- [x] POST /v1/whiskies adds a whiskey to the inventory
- [x] Only admins can add whiskies (403 for other roles)

#### US-004: List all whiskies

**As any** authenticated user,
**I want to** list all whiskies with pagination,
**So that** I can browse the inventory.

**Acceptance Criteria:**
- [x] GET /v1/whiskies returns paginated list
- [x] All roles can list whiskies

#### US-005: View a single whiskey

**As any** authenticated user,
**I want to** view the details of a single whiskey,
**So that** I can see its full information.

**Acceptance Criteria:**
- [x] GET /v1/whiskies/:whiskeyId returns the whiskey
- [x] Returns 404 if not found

#### US-006: Edit a whiskey in the inventory

**As an** admin,
**I want to** edit the details of a whiskey,
**So that** the inventory stays accurate.

**Acceptance Criteria:**
- [x] PATCH /v1/whiskies/:whiskeyId edits the whiskey
- [x] Only admins can edit whiskies (403 for other roles)

#### US-007: Remove a whiskey from the inventory

**As an** admin,
**I want to** remove a whiskey from the inventory,
**So that** it no longer appears in the catalogue.

**Acceptance Criteria:**
- [x] DELETE /v1/whiskies/:whiskeyId removes the whiskey
- [x] Only admins can remove whiskies (403 for other roles)

### Reviews

#### US-008: Add a whiskey review

**As a** reviewer,
**I want to** add a new review for a whiskey in the inventory,
**So that** my tasting notes are published.

**Acceptance Criteria:**
- [x] POST /v1/reviews adds a review with `status: published`
- [x] Review is associated with the authenticated reviewer's ID
- [x] Review references a `whiskeyId` from the inventory; returns 404 if not found
- [x] Viewers cannot add reviews (403)

#### US-009: List all whiskey reviews

**As a** reviewer or viewer,
**I want to** list all reviews with pagination,
**So that** I can browse tasting notes.

**Acceptance Criteria:**
- [x] GET /v1/reviews returns paginated list
- [x] Both roles can list reviews

#### US-010: View a single whiskey review

**As a** reviewer or viewer,
**I want to** view the details of a single review,
**So that** I can see its full tasting notes and rating.

**Acceptance Criteria:**
- [x] GET /v1/reviews/:reviewId returns the review
- [x] Returns 404 if not found

#### US-011: Edit my own whiskey review

**As a** reviewer,
**I want to** edit the details of a review I wrote,
**So that** I can keep my tasting notes accurate.

**Acceptance Criteria:**
- [x] PATCH /v1/reviews/:reviewId edits the review
- [x] Returns 403 if the review belongs to a different reviewer
- [x] Viewers cannot edit reviews (403)

#### US-012: Remove my own whiskey review

**As a** reviewer,
**I want to** remove a review I wrote,
**So that** it is no longer in the catalogue.

**Acceptance Criteria:**
- [x] DELETE /v1/reviews/:reviewId removes the review
- [x] Returns 403 if the review belongs to a different reviewer
- [x] Viewers cannot remove reviews (403)

## Constraints

1. In-memory store only (no database).
2. JavaScript (Node.js/Express) only.

## Success Metrics

1. All tests pass — `task api:test`.
2. OpenAPI and AsyncAPI lint cleanly — `task lint`.
3. A new developer can understand the full domain in under 5 minutes.
