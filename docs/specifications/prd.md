# Product Requirements Document — Whiskey Reviews

---

## Problem Statement

Whiskey enthusiasts need a dedicated API to record, share, and browse whiskey tasting reviews. Reviewers want to publish their tasting notes and ratings, while viewers want to discover new whiskies through curated reviews.

**Business:** Whiskey Reviews API — a community-driven whiskey review platform.

## Target Users / Personas

### Reviewer

A whiskey enthusiast who tastes and writes reviews.

- **Goal:** Record detailed tasting notes and ratings for whiskies, and keep their reviews up to date.
- **Frustration:** No structured way to capture whiskey metadata (distillery, region, age) alongside a personal rating.

### Viewer

A user who browses whiskey reviews without contributing.

- **Goal:** Discover new whiskies and read expert tasting notes.
- **Frustration:** Reviews edited or removed by others without their knowledge.

## Goals

1. Provide a whiskey review API that supports authentication, role-based access control, review lifecycle management, and pagination.
2. Capture whiskey-specific attributes: distillery, region, age statement, rating, and tasting notes.
3. Keep reviews owned by the reviewer who wrote them.

## Non-Goals

1. Persistent storage — the in-memory store resets on restart.
2. Social features (likes, comments, follows).
3. Whiskey catalogue management — reviews are self-contained entries.

## User Stories

### Authentication

#### US-001: Register as a reviewer or viewer

**As a** new user,
**I want to** register with an email, password, and role,
**So that** I can access the API.

**Acceptance Criteria:**
- [x] POST /v1/auth/register accepts `reviewer` or `viewer` role
- [x] Returns access token + refresh token on success
- [x] Returns 409 if email already registered

#### US-002: Log in and receive tokens

**As a** registered user,
**I want to** log in with my email and password,
**So that** I can get a fresh access token.

**Acceptance Criteria:**
- [x] POST /v1/auth/login returns 200 with tokens on valid credentials
- [x] Returns 401 on invalid credentials

### Reviews

#### US-003: Add a whiskey review

**As a** reviewer,
**I want to** add a new review with a whiskey name, distillery, rating, and optional tasting notes,
**So that** it appears in the reviews catalogue.

**Acceptance Criteria:**
- [x] POST /v1/reviews adds a review with `status: published`
- [x] Review is associated with the authenticated reviewer's ID
- [x] Viewers cannot add reviews (403)

#### US-004: List all whiskey reviews

**As a** reviewer or viewer,
**I want to** list all reviews with pagination,
**So that** I can browse the catalogue.

**Acceptance Criteria:**
- [x] GET /v1/reviews returns paginated list
- [x] Both roles can list reviews

#### US-005: View a single whiskey review

**As a** reviewer or viewer,
**I want to** view the details of a single review,
**So that** I can see its full tasting notes and rating.

**Acceptance Criteria:**
- [x] GET /v1/reviews/:reviewId returns the review
- [x] Returns 404 if not found

#### US-006: Edit my own whiskey review

**As a** reviewer,
**I want to** edit the details of a review I wrote,
**So that** I can keep my tasting notes accurate.

**Acceptance Criteria:**
- [x] PATCH /v1/reviews/:reviewId edits the review
- [x] Returns 403 if the review belongs to a different reviewer
- [x] Viewers cannot edit reviews (403)

#### US-007: Remove my own whiskey review

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
